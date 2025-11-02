import { NextRequest } from "next/server";
import { Role, Prisma } from "@prisma/client";
import { userRepository } from "@/lib/repositories";
import { requireRole } from "@/lib/auth/session";
import {
  successResponse,
  handleApiError,
} from "@/lib/api/response";

/**
 * GET /api/users
 * List all users (admin only)
 * Supports pagination and search
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin or super_admin role
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") as Role | null;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && Object.values(Role).includes(role)) {
      where.role = role;
    }

    // Get total count
    const total = await userRepository.countUsers(where);

    // Get users (automatically excludes passwords)
    const users = await userRepository.getAllUsers({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return successResponse({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
