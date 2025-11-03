import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userRepository } from "@/lib/repositories";
import { generateToken, getVerificationExpiry } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/send";
import { APP_URL } from "@/lib/email/resend";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api/response";
import {
  emailVerificationRateLimiter,
  checkRateLimit,
  getRateLimitIdentifier,
} from "@/lib/rate-limit";
import { activityLogRepository } from "@/lib/repositories";

const sendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = await checkRateLimit(
      emailVerificationRateLimiter,
      identifier
    );

    if (!rateLimit.success) {
      return errorResponse(
        "Too many requests. Please try again later.",
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
    const result = sendVerificationSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { email } = result.data;

    // Find user by email
    const user = await userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal that user doesn't exist (security)
      return successResponse({
        message: "If the email exists, a verification link has been sent.",
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return errorResponse("Email is already verified");
    }

    // Generate verification token
    const verificationToken = generateToken();
    const verificationExpires = getVerificationExpiry();

    // Update user with verification token
    await userRepository.update(user.id, {
      verificationToken,
      verificationExpires,
    });

    // Create verification URL
    const verificationUrl = `${APP_URL}/verify-email?token=${verificationToken}`;

    // Send verification email
    const emailResult = await sendVerificationEmail(
      email,
      user.username,
      verificationUrl
    );

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      return errorResponse("Failed to send verification email");
    }

    // Log activity
    await activityLogRepository.create({
      userId: user.id,
      action: "SEND_VERIFICATION_EMAIL",
      resource: "auth",
      details: { email },
      ipAddress: identifier,
      userAgent: request.headers.get("user-agent"),
    });

    return successResponse(
      {
        message: "Verification email sent successfully",
      },
      {
        "X-RateLimit-Limit": rateLimit.limit?.toString() || "0",
        "X-RateLimit-Remaining": rateLimit.remaining?.toString() || "0",
        "X-RateLimit-Reset": rateLimit.reset?.toString() || "0",
      }
    );
  } catch (error) {
    console.error("Send verification error:", error);
    return errorResponse("Internal server error");
  }
}
