/**
 * POST /api/users/me/2fa/disable
 *
 * Disable 2FA for user (requires password confirmation)
 * Removes secret and backup codes from database
 */

import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  successResponse,
  unauthorizedResponse,
  handleApiError,
  badRequestResponse,
} from "@/lib/api/response";
import { verifyPassword } from "@/lib/auth/password";
import { userRepository } from "@/lib/repositories";
import { disableTwoFactorSchema } from "@/lib/validations/two-factor";
import { logActivity } from "@/lib/repositories/activity-log.repository";

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return badRequestResponse("Two-factor authentication is not enabled");
    }

    // Parse and validate request body
    const body = await request.json();
    const { password } = disableTwoFactorSchema.parse(body);

    // Get user with password for verification
    const userWithPassword = await userRepository.findByIdWithPassword(user.id);
    if (!userWithPassword) {
      return unauthorizedResponse();
    }

    // Verify password
    const isValidPassword = await verifyPassword(
      password,
      userWithPassword.password
    );
    if (!isValidPassword) {
      return badRequestResponse("Incorrect password");
    }

    // Disable 2FA in database
    await userRepository.disableTwoFactor(user.id);

    // Log activity
    await logActivity({
      userId: user.id,
      action: "DISABLE_2FA",
      resource: "security",
      resourceId: user.id,
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return successResponse({
      message: "Two-factor authentication disabled successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
