import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userRepository } from "@/lib/repositories";
import { generateToken, getPasswordResetExpiry } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/email/send";
import { APP_URL } from "@/lib/email/resend";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api/response";
import {
  passwordResetRateLimiter,
  checkRateLimit,
  getRateLimitIdentifier,
} from "@/lib/rate-limit";
import { activityLogRepository } from "@/lib/repositories";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = await checkRateLimit(
      passwordResetRateLimiter,
      identifier
    );

    if (!rateLimit.success) {
      return errorResponse(
        "Too many requests. Please try again later.",
        429,
        {
          headers: {
            "X-RateLimit-Limit": rateLimit.limit?.toString() || "0",
            "X-RateLimit-Remaining": rateLimit.remaining?.toString() || "0",
            "X-RateLimit-Reset": rateLimit.reset?.toString() || "0",
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { email } = result.data;

    // Find user by email
    const user = await userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal that user doesn't exist (security)
      return successResponse(
        {
          message:
            "If the email exists, a password reset link has been sent.",
        },
        200,
        {
          headers: {
            "X-RateLimit-Limit": rateLimit.limit?.toString() || "0",
            "X-RateLimit-Remaining": rateLimit.remaining?.toString() || "0",
            "X-RateLimit-Reset": rateLimit.reset?.toString() || "0",
          },
        }
      );
    }

    // Generate password reset token
    const passwordResetToken = generateToken();
    const passwordResetExpires = getPasswordResetExpiry();

    // Update user with reset token
    await userRepository.updateById(user.id, {
      passwordResetToken,
      passwordResetExpires,
    });

    // Create reset URL
    const resetUrl = `${APP_URL}/reset-password?token=${passwordResetToken}`;

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      email,
      user.username,
      resetUrl
    );

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error);
      return errorResponse("Failed to send password reset email");
    }

    // Log activity
    await activityLogRepository.createLog({
      userId: user.id,
      action: "REQUEST_PASSWORD_RESET",
      resource: "auth",
      details: { email },
      ipAddress: identifier,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return successResponse(
      {
        message: "Password reset email sent successfully",
      },
      200,
      {
        headers: {
          "X-RateLimit-Limit": rateLimit.limit?.toString() || "0",
          "X-RateLimit-Remaining": rateLimit.remaining?.toString() || "0",
          "X-RateLimit-Reset": rateLimit.reset?.toString() || "0",
        },
      }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return errorResponse("Internal server error");
  }
}
