import { NextRequest } from "next/server";
import { userRepository } from "@/lib/repositories";
import { requireAuth } from "@/lib/auth/session";
import { updateProfileSchema } from "@/lib/validations/user";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api/response";

/**
 * GET /api/users/me
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Fetch fresh user data from database
    const currentUser = await userRepository.findById(user.id);

    if (!currentUser) {
      return errorResponse("User not found", 404);
    }

    return successResponse({
      user: currentUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/users/me
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Check if username is being changed and if it's taken
    if (validatedData.username) {
      const existingUsername = await userRepository.findByUsername(validatedData.username);
      if (existingUsername && existingUsername.id !== user.id) {
        return errorResponse("Username already taken", 409);
      }
    }

    // Check if email is being changed and if it's taken
    if (validatedData.email) {
      const existingEmail = await userRepository.findByEmail(validatedData.email);
      if (existingEmail && existingEmail.id !== user.id) {
        return errorResponse("Email already registered", 409);
      }
    }

    // Update user profile
    const updatedUser = await userRepository.updateUser(user.id, validatedData);

    return successResponse({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
