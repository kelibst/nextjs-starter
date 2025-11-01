import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, toSessionUser } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations/auth";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api/response";

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.emailOrUsername },
          { username: validatedData.emailOrUsername },
        ],
      },
    });

    // Check if user exists
    if (!user) {
      return errorResponse("Invalid email/username or password", 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      return errorResponse("Invalid email/username or password", 401);
    }

    // Create session
    await createSession(user.id, user.role);

    // Return user data (without password)
    return successResponse({
      message: "Login successful",
      user: toSessionUser(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
