/**
 * System Settings API Routes
 * GET /api/admin/settings - Get current settings
 * PATCH /api/admin/settings - Update settings
 */

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import {
  successResponse,
  handleApiError,
  unauthorizedResponse,
} from "@/lib/api/response";
import {
  getAuthSettings,
  updateAuthSettings,
  type AuthSettings,
} from "@/lib/settings";
import { z } from "zod";
import { logActivity } from "@/lib/utils/activity-logger";

// ============================================================================
// Validation
// ============================================================================

const updateSettingsSchema = z.object({
  // Authentication methods
  allowPasswordAuth: z.boolean().optional(),
  allowGoogleOAuth: z.boolean().optional(),
  allowGithubOAuth: z.boolean().optional(),

  // Registration requirements
  requireUsername: z.boolean().optional(),
  requireEmail: z.boolean().optional(),

  // Security options
  emailVerificationRequired: z.boolean().optional(),
  twoFactorRequired: z.boolean().optional(),
  allowSelfRegistration: z.boolean().optional(),
});

// ============================================================================
// GET /api/admin/settings
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Require ADMIN or SUPER_ADMIN role
    const user = await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    if (!user) {
      return unauthorizedResponse();
    }

    // Get current settings
    const settings = await getAuthSettings();

    return successResponse({ settings });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================================
// PATCH /api/admin/settings
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    // Require ADMIN or SUPER_ADMIN role
    const user = await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    if (!user) {
      return unauthorizedResponse();
    }

    // Parse and validate request body
    const body = await request.json();
    const updates = updateSettingsSchema.parse(body);

    // Get old settings for activity log
    const oldSettings = await getAuthSettings();

    // Update settings
    const newSettings = await updateAuthSettings(updates, user.id);

    // Log activity
    await logActivity({
      userId: user.id,
      action: "UPDATE_SETTINGS",
      resource: "system_settings",
      resourceId: "auth_settings",
      details: {
        old: oldSettings,
        new: newSettings,
      },
    });

    return successResponse({
      settings: newSettings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
