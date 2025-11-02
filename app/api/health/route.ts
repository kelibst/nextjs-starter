import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

/**
 * Health Check Endpoint
 *
 * Used by monitoring services (UptimeRobot, StatusPage, etc.) to verify
 * application and database connectivity.
 *
 * Returns:
 * - 200 OK if both app and database are healthy
 * - 503 Service Unavailable if database is unreachable
 *
 * @route GET /api/health
 */
export async function GET() {
  try {
    // Check database connectivity with a simple query
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
      environment: process.env.NODE_ENV || "development",
    }, { status: 200 });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 503 });
  }
}
