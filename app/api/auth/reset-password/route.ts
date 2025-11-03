import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userRepository } from "@/lib/repositories";
import { isTokenExpired } from "@/lib/auth/tokens";
import { hashPassword } from "@/lib/auth/password";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api/response";
import { activityLogRepository } from "@/lib/repositories";
import { getRateLimitIdentifier } from "@/lib/rate-limit";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number, and special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { token, password } = result.data;

    // Find user by password reset token
    const user = await userRepository.findByPasswordResetToken(token);

    if (!user) {
      return errorResponse("Invalid password reset token");
    }

    // Check if token expired
    if (isTokenExpired(user.passwordResetExpires)) {
      return errorResponse(
        "Password reset token has expired. Please request a new one."
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    await userRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    // Log activity
    const identifier = getRateLimitIdentifier(request);
    await activityLogRepository.createLog({
      userId: user.id,
      action: "RESET_PASSWORD",
      resource: "auth",
      details: { email: user.email },
      ipAddress: identifier,
      userAgent: request.headers.get("user-agent"),
    });

    return successResponse({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return errorResponse("Internal server error");
  }
}
