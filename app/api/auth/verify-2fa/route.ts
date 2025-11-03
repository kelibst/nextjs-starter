/**
 * POST /api/auth/verify-2fa
 *
 * Verify 2FA code during login
 * Accepts either TOTP token or backup code
 * Creates session upon successful verification
 */

import { NextRequest } from "next/server";
import {
  successResponse,
  badRequestResponse,
  handleApiError,
  unauthorizedResponse,
} from "@/lib/api/response";
import {
  verifyTwoFactorToken,
  verifyBackupCode,
} from "@/lib/auth/two-factor";
import { userRepository } from "@/lib/repositories";
import { twoFactorVerifySchema } from "@/lib/validations/two-factor";
import { createSession } from "@/lib/auth/session";
import { activityLogRepository } from "@/lib/repositories/activity-log.repository";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { code, isBackupCode, userId } = twoFactorVerifySchema.parse(body);

    if (!userId) {
      return badRequestResponse("User ID is required");
    }

    // Get user with 2FA details
    const user = await userRepository.findById(userId);
    if (!user || !user.twoFactorEnabled) {
      return unauthorizedResponse("Invalid request");
    }

    let isValid = false;
    let usedBackupCodeIndex = -1;

    if (isBackupCode) {
      // Verify backup code
      const backupCodes = await userRepository.getBackupCodes(userId);
      const result = await verifyBackupCode(code, backupCodes);
      isValid = result.valid;
      usedBackupCodeIndex = result.index;

      if (isValid) {
        // Remove used backup code
        await userRepository.removeBackupCode(userId, usedBackupCodeIndex);
      }
    } else {
      // Verify TOTP token
      const secret = await userRepository.getTwoFactorSecret(userId);
      if (!secret) {
        return unauthorizedResponse("2FA not properly configured");
      }
      isValid = verifyTwoFactorToken(code, secret);
    }

    if (!isValid) {
      // Log failed 2FA attempt
      await activityLogRepository.createLog({
        userId: userId,
        action: "FAILED_2FA",
        resource: "auth",
        details: { reason: isBackupCode ? "Invalid backup code" : "Invalid TOTP token" },
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      });

      return badRequestResponse(
        isBackupCode
          ? "Invalid backup code. Please try again."
          : "Invalid verification code. Please try again."
      );
    }

    // Create session
    const sessionResponse = await createSession(user.id, user.role);

    // Log successful 2FA login
    await activityLogRepository.createLog({
      userId: userId,
      action: "LOGIN_2FA",
      resource: "auth",
      details: { method: isBackupCode ? "backup_code" : "totp" },
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return successResponse(
      {
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      },
      200,
      { headers: sessionResponse.headers }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
