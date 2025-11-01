import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession, toSessionUser } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validations/auth";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api/response";

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
    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUsername) {
      return errorResponse("Username already taken", 409);
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return errorResponse("Email already registered", 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user with default role
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        role: Role.USER,
      },
    });

    // Create session (auto-login after registration)
    await createSession(user.id, user.role);

    // Return user data (without password)
    return successResponse(
      {
        message: "Registration successful",
        user: toSessionUser(user),
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
