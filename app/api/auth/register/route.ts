import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { userRepository } from "@/lib/repositories";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validations/auth";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api/response";
import { logAuth, ActivityAction } from "@/lib/utils/activity-logger";
import {
  registerRateLimiter,
  checkRateLimit,
  getRateLimitIdentifier,
} from "@/lib/rate-limit";
import { generateToken, getVerificationExpiry } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/send";
import { APP_URL } from "@/lib/email/resend";

/**
 * POST /api/auth/register
 * Register a new user account
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = await checkRateLimit(registerRateLimiter, identifier);

    if (!rateLimit.success) {
      return errorResponse(
        "Too many registration attempts. Please try again later.",
        429,
        {
          "X-RateLimit-Limit": rateLimit.limit?.toString() || "0",
          "X-RateLimit-Remaining": rateLimit.remaining?.toString() || "0",
          "X-RateLimit-Reset": rateLimit.reset?.toString() || "0",
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if username already exists
    const usernameExists = await userRepository.usernameExists(
      validatedData.username
    );
    if (usernameExists) {
      return errorResponse("Username already taken", 409);
    }

    // Check if email already exists
    const emailExists = await userRepository.emailExists(validatedData.email);
    if (emailExists) {
      return errorResponse("Email already registered", 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Generate verification token
    const verificationToken = generateToken();
    const verificationExpires = getVerificationExpiry();

    // Create user with default role and verification token
    const user = await userRepository.createUser({
      username: validatedData.username,
      email: validatedData.email,
      password: hashedPassword,
      role: Role.USER,
    });

    // Update user with verification token
    await userRepository.update(user.id, {
      emailVerified: false,
      verificationToken,
      verificationExpires,
    });

    // Send verification email (don't block registration if email fails)
    try {
      const verificationUrl = `${APP_URL}/verify-email?token=${verificationToken}`;
      await sendVerificationEmail(
        validatedData.email,
        validatedData.username,
        verificationUrl
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue with registration even if email fails
    }

    // Create session (auto-login after registration)
    await createSession(user.id, user.role);

    // Log registration
    await logAuth(ActivityAction.REGISTER, user.id, {
      username: user.username,
      email: user.email,
    });

    // Return user data (already safe from repository)
    return successResponse(
      {
        message: "Registration successful. Please check your email to verify your account.",
        user: {
          ...user,
          emailVerified: false,
        },
      },
      201,
      {
        "X-RateLimit-Limit": rateLimit.limit?.toString() || "0",
        "X-RateLimit-Remaining": rateLimit.remaining?.toString() || "0",
        "X-RateLimit-Reset": rateLimit.reset?.toString() || "0",
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
