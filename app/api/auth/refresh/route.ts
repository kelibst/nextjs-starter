import { NextRequest } from "next/server";
import { refreshSession } from "@/lib/auth/session";
import {
  successResponse,
  unauthorizedResponse,
  handleApiError,
} from "@/lib/api/response";

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * Implements token rotation for security
 */
export async function POST(request: NextRequest) {
  try {
    // Attempt to refresh session (rotates tokens)
    const refreshed = await refreshSession();

    if (!refreshed) {
      return unauthorizedResponse("Invalid or expired refresh token");
    }

    return successResponse({
      message: "Token refreshed successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
