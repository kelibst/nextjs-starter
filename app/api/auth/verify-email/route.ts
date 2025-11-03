import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/repositories";
import { isTokenExpired } from "@/lib/auth/tokens";
import { successResponse, errorResponse } from "@/lib/api/response";
import { activityLogRepository } from "@/lib/repositories";
import { getRateLimitIdentifier } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return errorResponse("Verification token is required");
    }

    // Find user by verification token
    const user = await userRepository.findByVerificationToken(token);

    if (!user) {
      return errorResponse("Invalid verification token");
    }

    // Check if already verified
    if (user.emailVerified) {
      return successResponse({
        message: "Email is already verified",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      });
    }

    // Check if token expired
    if (isTokenExpired(user.verificationExpires)) {
      return errorResponse(
        "Verification token has expired. Please request a new one."
      );
    }

    // Verify email and clear token
    await userRepository.update(user.id, {
      emailVerified: true,
      verificationToken: null,
      verificationExpires: null,
    });

    // Log activity
    const identifier = getRateLimitIdentifier(request);
    await activityLogRepository.createLog({
      userId: user.id,
      action: "VERIFY_EMAIL",
      resource: "auth",
      details: { email: user.email },
      ipAddress: identifier,
      userAgent: request.headers.get("user-agent"),
    });

    return successResponse({
      message: "Email verified successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return errorResponse("Internal server error");
  }
}
