import { NextRequest } from "next/server";
import { userRepository, refreshTokenRepository } from "@/lib/repositories";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { requireAuth } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validations/auth";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api/response";

/**
 * PATCH /api/users/me/password
 * Change current user's password
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);

    // Get current user with password
    const currentUser = await userRepository.findByIdWithPassword(user.id);

    if (!currentUser) {
      return errorResponse("User not found", 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      validatedData.currentPassword,
      currentUser.password
    );

    if (!isCurrentPasswordValid) {
      return errorResponse("Current password is incorrect", 401);
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(validatedData.newPassword);

    // Update password in database
    await userRepository.updateUser(user.id, {
      password: hashedNewPassword,
    });

    // Optionally invalidate all refresh tokens to force re-login on all devices
    // Uncomment to enable this security feature:
    // await refreshTokenRepository.deleteByUserId(user.id);

    return successResponse({
      message: "Password changed successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
