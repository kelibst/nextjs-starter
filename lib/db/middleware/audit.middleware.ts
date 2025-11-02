import { Prisma } from "@prisma/client";

/**
 * Audit Middleware for Prisma
 *
 * Logs all database queries in development mode for debugging and security auditing.
 * This helps track down security issues, performance problems, and data access patterns.
 *
 * Enable detailed query logging by setting: LOG_QUERIES=true in .env
 */
export function auditMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const before = Date.now();

    // Execute the query
    const result = await next(params);

    const after = Date.now();
    const duration = after - before;

    // Only log in development mode if LOG_QUERIES is enabled
    if (process.env.NODE_ENV === "development" && process.env.LOG_QUERIES === "true") {
      const logData = {
        model: params.model,
        action: params.action,
        duration: `${duration}ms`,
        args: sanitizeArgs(params.args),
      };

      console.log("[Prisma Audit]:", JSON.stringify(logData, null, 2));
    }

    // Log slow queries in production (>1000ms)
    if (process.env.NODE_ENV === "production" && duration > 1000) {
      console.warn("[Prisma Slow Query]:", {
        model: params.model,
        action: params.action,
        duration: `${duration}ms`,
      });
    }

    return result;
  };
}

/**
 * Sanitize query arguments to prevent logging sensitive data
 */
function sanitizeArgs(args: any): any {
  if (!args) return args;

  // Create a deep copy to avoid mutating original
  const sanitized = JSON.parse(JSON.stringify(args));

  // Redact password fields
  if (sanitized.data?.password) {
    sanitized.data.password = "[REDACTED]";
  }

  if (sanitized.where?.password) {
    sanitized.where.password = "[REDACTED]";
  }

  // Redact tokens
  if (sanitized.data?.token) {
    sanitized.data.token = "[REDACTED]";
  }

  if (sanitized.where?.token) {
    sanitized.where.token = "[REDACTED]";
  }

  return sanitized;
}
