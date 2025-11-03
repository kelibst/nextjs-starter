/**
 * POST /api/users/me/2fa/enable
 *
 * Verify TOTP token and enable 2FA for user
 * Generates backup codes and saves secret to database
 */

import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  successResponse,
  unauthorizedResponse,
  handleApiError,
  conflictResponse,
  badRequestResponse,
} from "@/lib/api/response";
import {
  verifyTwoFactorToken,
  generateBackupCodes,
} from "@/lib/auth/two-factor";
import { userRepository } from "@/lib/repositories";
import { enableTwoFactorSchema } from "@/lib/validations/two-factor";
import { logActivity } from "@/lib/repositories/activity-log.repository";

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return conflictResponse("Two-factor authentication is already enabled");
    }

    // Parse and validate request body
    const body = await request.json();
    const { token } = enableTwoFactorSchema.parse(body);

    // Get the secret from request body (sent from frontend after setup)
    const { secret } = body;
    if (!secret || typeof secret !== "string") {
      return badRequestResponse("Secret is required");
    }

    // Verify the TOTP token with the secret
    const isValid = verifyTwoFactorToken(token, secret);
    if (!isValid) {
      return badRequestResponse("Invalid verification code. Please try again.");
    }

    // Generate backup codes
    const { codes, hashed } = await generateBackupCodes(10);

    // Enable 2FA in database
    await userRepository.enableTwoFactor(user.id, secret, hashed);

    // Log activity
    await logActivity({
      userId: user.id,
      action: "ENABLE_2FA",
      resource: "security",
      resourceId: user.id,
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return successResponse({
      message: "Two-factor authentication enabled successfully",
      backupCodes: codes,
      warning:
        "Save these backup codes in a safe place. Each code can only be used once.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
