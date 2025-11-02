import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth/session";
import { successResponse, handleApiError } from "@/lib/api/response";
import { activityLogRepository } from "@/lib/repositories";

/**
 * GET /api/admin/logs
 * Get activity logs with optional filters
 * Protected: SUPER_ADMIN only
 */
export async function GET(request: NextRequest) {
  try {
    // Only super admins can view activity logs
    await requireRole(Role.SUPER_ADMIN);

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const userId = searchParams.get("userId") || undefined;
    const action = searchParams.get("action") || undefined;
    const resource = searchParams.get("resource") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Date range filters
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause for count
    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Get total count
    const total = await activityLogRepository.countLogs(where);

    // Get logs
    const logs = await activityLogRepository.getLogs({
      userId,
      action,
      resource,
      startDate,
      endDate,
      skip,
      take: limit,
    });

    return successResponse({
      logs,
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

/**
 * DELETE /api/admin/logs
 * Delete old logs or all logs
 * Protected: SUPER_ADMIN only
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireRole(Role.SUPER_ADMIN);

    const { searchParams } = new URL(request.url);
    const deleteAll = searchParams.get("all") === "true";
    const olderThan = searchParams.get("olderThan");

    let result;

    if (deleteAll) {
      // Delete all logs (DANGER ZONE)
      result = await activityLogRepository.deleteAllLogs();
    } else if (olderThan) {
      // Delete logs older than specified days
      const days = parseInt(olderThan);
      const beforeDate = new Date();
      beforeDate.setDate(beforeDate.getDate() - days);
      result = await activityLogRepository.deleteOldLogs(beforeDate);
    } else {
      return successResponse(
        { message: "Please specify 'all=true' or 'olderThan' parameter" },
        400
      );
    }

    return successResponse({
      message: `Deleted ${result.count} activity logs`,
      count: result.count,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
