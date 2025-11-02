import { NextRequest } from "next/server";
import { destroySession, getCurrentUser } from "@/lib/auth/session";
import { successResponse, handleApiError } from "@/lib/api/response";
import { logAuth, ActivityAction } from "@/lib/utils/activity-logger";

/**
 * POST /api/auth/logout
 * Destroy user session and clear cookies
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user before destroying session
    const user = await getCurrentUser();

    // Destroy session (delete refresh token from DB and clear cookies)
    await destroySession();

    // Log logout if user was authenticated
    if (user) {
      await logAuth(ActivityAction.LOGOUT, user.id);
    }

    return successResponse({
      message: "Logout successful",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
