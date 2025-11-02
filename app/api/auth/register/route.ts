import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { userRepository } from "@/lib/repositories";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validations/auth";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api/response";
import { logAuth, ActivityAction } from "@/lib/utils/activity-logger";

/**
 * POST /api/auth/register
 * Register a new user account
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if username already exists
    const usernameExists = await userRepository.usernameExists(validatedData.username);
    if (usernameExists) {
      return errorResponse("Username already taken", 409);
    }

    // Check if email already exists
    const emailExists = await userRepository.emailExists(validatedData.email);
    if (emailExists) {
      return errorResponse("Email already registered", 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user with default role (repository automatically excludes password)
    const user = await userRepository.createUser({
      username: validatedData.username,
      email: validatedData.email,
      password: hashedPassword,
      role: Role.USER,
    });

    // Create session (auto-login after registration)
    await createSession(user.id, user.role);

    // Log registration
    await logAuth(ActivityAction.REGISTER, user.id, {
      username: user.username,
      email: user.email,
    });

    // Return user data (already safe from repository)
    return successResponse(
      {
        message: "Registration successful",
        user,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
