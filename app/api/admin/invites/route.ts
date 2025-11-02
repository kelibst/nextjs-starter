import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole, getCurrentUser } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { successResponse, handleApiError } from "@/lib/api/response";
import { userRepository, inviteRepository } from "@/lib/repositories";

const createInviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
});

/**
 * POST /api/admin/invites
 * Create a new user invite
 * Protected: ADMIN, SUPER_ADMIN
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);
    const currentUser = await getCurrentUser();

    // Parse and validate request body
    const body = await request.json();
    const data = createInviteSchema.parse(body);

    // Check if email already has an account
    const emailExists = await userRepository.emailExists(data.email);

    if (emailExists) {
      return Response.json(
        { success: false, error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invite
    const existingInvite = await inviteRepository.findByEmail(data.email);

    if (existingInvite) {
      return Response.json(
        { success: false, error: "An invite for this email already exists" },
        { status: 400 }
      );
    }

    // Create invite (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await inviteRepository.createInvite({
      email: data.email,
      role: data.role as Role,
      expiresAt,
      createdBy: currentUser!.id,
    });

    // In a production app, you would send an email here
    // For now, we return the invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`;

    return successResponse({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        token: invite.token,
        expiresAt: invite.expiresAt,
        inviteLink,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/admin/invites
 * Get all invites
 * Protected: ADMIN, SUPER_ADMIN
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const invites = await inviteRepository.getAllInvites({
      includeUsed: true,
      includeExpired: true,
    });

    return successResponse({ invites });
  } catch (error) {
    return handleApiError(error);
  }
}
