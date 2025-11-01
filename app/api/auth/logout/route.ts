import { NextRequest } from "next/server";
import { destroySession } from "@/lib/auth/session";
import { successResponse, handleApiError } from "@/lib/api/response";

/**
 * POST /api/auth/logout
 * Destroy user session and clear cookies
 */
export async function POST(request: NextRequest) {
  try {
    // Destroy session (delete refresh token from DB and clear cookies)
    await destroySession();

    return successResponse({
      message: "Logout successful",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
