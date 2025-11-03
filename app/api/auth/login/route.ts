import { NextRequest } from "next/server";
import { userRepository } from "@/lib/repositories";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations/auth";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api/response";
import { logAuth, ActivityAction } from "@/lib/utils/activity-logger";
import {
  loginRateLimiter,
  checkRateLimit,
  getRateLimitIdentifier,
} from "@/lib/rate-limit";

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = await checkRateLimit(loginRateLimiter, identifier);

    if (!rateLimit.success) {
      return errorResponse(
        "Too many login attempts. Please try again in 15 minutes.",
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
    const validatedData = loginSchema.parse(body);

    // Find user by email or username (WITH password for verification)
    const user = await userRepository.findByEmailOrUsername(
      validatedData.emailOrUsername
    );

    // Check if user exists
    if (!user) {
      // Log failed login attempt
      await logAuth(ActivityAction.LOGIN_FAILED, undefined, {
        emailOrUsername: validatedData.emailOrUsername,
        reason: "User not found",
      });
      return errorResponse("Invalid email/username or password", 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      // Log failed login attempt
      await logAuth(ActivityAction.LOGIN_FAILED, user.id, {
        reason: "Invalid password",
      });
      return errorResponse("Invalid email/username or password", 401);
    }

    // Create session
    await createSession(user.id, user.role);

    // Log successful login
    await logAuth(ActivityAction.LOGIN, user.id);

    // Return user data (remove password)
    const { password: _, ...safeUser } = user;

    return successResponse(
      {
        message: "Login successful",
        user: safeUser,
      },
      200,
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
