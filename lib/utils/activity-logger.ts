import { activityLogRepository } from "@/lib/repositories";
import { headers } from "next/headers";

/**
 * Activity Logger Utility
 *
 * Helper functions to log user activities for audit trail.
 * All logs are stored in the database via activityLogRepository.
 */

/**
 * Log an activity
 */
export async function logActivity(data: {
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: any;
}): Promise<void> {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await activityLogRepository.createLog({
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    // Log error but don't throw - activity logging should not break the main flow
    console.error("[Activity Logger Error]:", error);
  }
}

/**
 * Predefined action types for consistency
 */
export const ActivityAction = {
  // Authentication
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  LOGIN_FAILED: "LOGIN_FAILED",
  REGISTER: "REGISTER",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
  TOKEN_REFRESH: "TOKEN_REFRESH",

  // User Management
  USER_CREATE: "USER_CREATE",
  USER_UPDATE: "USER_UPDATE",
  USER_DELETE: "USER_DELETE",
  USER_ROLE_CHANGE: "USER_ROLE_CHANGE",

  // Admin Actions
  INVITE_CREATE: "INVITE_CREATE",
  INVITE_USE: "INVITE_USE",
  SETTINGS_UPDATE: "SETTINGS_UPDATE",

  // Security
  UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
  PERMISSION_DENIED: "PERMISSION_DENIED",
} as const;

/**
 * Helper to log authentication events
 */
export async function logAuth(action: string, userId?: string, details?: any) {
  return logActivity({
    userId,
    action,
    resource: "auth",
    details,
  });
}

/**
 * Helper to log user management events
 */
export async function logUserEvent(action: string, userId: string, targetUserId: string, details?: any) {
  return logActivity({
    userId,
    action,
    resource: "users",
    resourceId: targetUserId,
    details,
  });
}
