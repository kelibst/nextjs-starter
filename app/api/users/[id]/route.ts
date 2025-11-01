import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { requireRole, toSessionUser } from "@/lib/auth/session";
import { adminUpdateUserSchema } from "@/lib/validations/user";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/api/response";

/**
 * GET /api/users/:id
 * Get user by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin or super_admin role
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return notFoundResponse("User not found");
    }

    return successResponse({
      user: toSessionUser(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/users/:id
 * Update user by ID (admin only)
 * Super admin can update any user including role
 * Admin can only update regular users (not other admins)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current user
    const currentUser = await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = adminUpdateUserSchema.parse(body);

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return notFoundResponse("User not found");
    }

    // Check permissions
    // Only SUPER_ADMIN can update admins or change roles
    if (currentUser.role === Role.ADMIN) {
      if (targetUser.role !== Role.USER) {
        return forbiddenResponse("Admins can only update regular users");
      }

      if (validatedData.role && validatedData.role !== Role.USER) {
        return forbiddenResponse("Admins cannot change user roles");
      }
    }

    // Check if username is being changed and if it's taken
    if (validatedData.username && validatedData.username !== targetUser.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: validatedData.username },
      });

      if (existingUsername) {
        return forbiddenResponse("Username already taken");
      }
    }

    // Check if email is being changed and if it's taken
    if (validatedData.email && validatedData.email !== targetUser.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingEmail) {
        return forbiddenResponse("Email already registered");
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: validatedData,
    });

    return successResponse({
      message: "User updated successfully",
      user: toSessionUser(updatedUser),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/users/:id
 * Delete user by ID (super admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only super admins can delete users
    const currentUser = await requireRole(Role.SUPER_ADMIN);

    const { id } = await params;

    // Prevent self-deletion
    if (currentUser.id === id) {
      return forbiddenResponse("Cannot delete your own account");
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return notFoundResponse("User not found");
    }

    // Delete user (refresh tokens will be cascade deleted)
    await prisma.user.delete({
      where: { id },
    });

    return successResponse({
      message: "User deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
