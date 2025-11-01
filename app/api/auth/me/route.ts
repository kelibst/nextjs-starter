import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  successResponse,
  unauthorizedResponse,
  handleApiError,
} from "@/lib/api/response";

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse("Not authenticated");
    }

    return successResponse({
      user,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
