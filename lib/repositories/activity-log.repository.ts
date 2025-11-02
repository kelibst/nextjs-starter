import { ActivityLog, Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { BaseRepository } from "./base.repository";

/**
 * ActivityLog with User relation
 */
export type ActivityLogWithUser = Prisma.ActivityLogGetPayload<{
  include: { user: true };
}>;

/**
 * Activity Log Repository
 * Handles all activity log-related database operations
 */
class ActivityLogRepository extends BaseRepository<ActivityLog, typeof prisma.activityLog> {
  protected delegate = prisma.activityLog;
  protected modelName = "ActivityLog";

  /**
   * Create a new activity log entry
   */
  async createLog(data: {
    userId?: string;
    action: string;
    resource?: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<ActivityLog> {
    this.logQuery("createLog", { ...data, details: "[REDACTED]" });
    return this.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  /**
   * Get activity logs with optional filters
   */
  async getLogs(options?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }): Promise<ActivityLogWithUser[]> {
    this.logQuery("getLogs", options);

    const where: Prisma.ActivityLogWhereInput = {};

    if (options?.userId) where.userId = options.userId;
    if (options?.action) where.action = options.action;
    if (options?.resource) where.resource = options.resource;

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = options.startDate;
      if (options.endDate) where.createdAt.lte = options.endDate;
    }

    return this.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: options?.skip,
      take: options?.take || 50,
    });
  }

  /**
   * Count activity logs
   */
  async countLogs(where?: Prisma.ActivityLogWhereInput): Promise<number> {
    this.logQuery("countLogs", { where });
    return this.count({ where });
  }

  /**
   * Delete logs older than specified date
   */
  async deleteOldLogs(beforeDate: Date): Promise<{ count: number }> {
    this.logQuery("deleteOldLogs", { beforeDate });
    return this.deleteMany({
      where: {
        createdAt: {
          lt: beforeDate,
        },
      },
    });
  }

  /**
   * Delete all logs (DANGER ZONE)
   */
  async deleteAllLogs(): Promise<{ count: number }> {
    this.logQuery("deleteAllLogs", {});
    return this.deleteMany({});
  }
}

// Export singleton instance
export const activityLogRepository = new ActivityLogRepository();
