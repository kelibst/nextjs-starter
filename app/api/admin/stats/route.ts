import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { successResponse, handleApiError } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/admin/stats
 * Get system statistics for admin dashboard
 * Protected: ADMIN, SUPER_ADMIN
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    // Get total user count
    const totalUsers = await prisma.user.count();

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    });

    // Get users created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const usersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    // Get users created this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    const usersThisWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: weekAgo,
        },
      },
    });

    // Get users created this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const usersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
    });

    // Get recent users (last 5)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Format role counts for easier consumption
    const roleCounts = {
      USER: 0,
      ADMIN: 0,
      SUPER_ADMIN: 0,
    };

    usersByRole.forEach((group) => {
      roleCounts[group.role] = group._count.role;
    });

    return successResponse({
      totalUsers,
      usersToday,
      usersThisWeek,
      usersThisMonth,
      roleCounts,
      recentUsers,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
