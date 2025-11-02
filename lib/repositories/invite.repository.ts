import { Invite, Role, Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { BaseRepository } from "./base.repository";

/**
 * Invite with Creator relation
 */
export type InviteWithCreator = Prisma.InviteGetPayload<{
  include: { creator: true };
}>;

/**
 * Invite Repository
 * Handles all invite-related database operations
 */
class InviteRepository extends BaseRepository<Invite, typeof prisma.invite> {
  protected delegate = prisma.invite;
  protected modelName = "Invite";

  /**
   * Find invite by token
   */
  async findByToken(token: string): Promise<Invite | null> {
    this.logQuery("findByToken", { token });
    return this.findUnique({
      where: { token },
    });
  }

  /**
   * Find invite by token (with creator relation)
   */
  async findByTokenWithCreator(token: string): Promise<InviteWithCreator | null> {
    this.logQuery("findByTokenWithCreator", { token });
    return this.findUnique({
      where: { token },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  /**
   * Find invite by email (most recent unused)
   */
  async findByEmail(email: string): Promise<Invite | null> {
    this.logQuery("findByEmail", { email });
    return this.findFirst({
      where: {
        email,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get all invites (with optional filters)
   */
  async getAllInvites(options?: {
    includeUsed?: boolean;
    includeExpired?: boolean;
  }): Promise<Invite[]> {
    this.logQuery("getAllInvites", options);

    const where: Prisma.InviteWhereInput = {};

    if (!options?.includeUsed) {
      where.usedAt = null;
    }

    if (!options?.includeExpired) {
      where.expiresAt = {
        gt: new Date(),
      };
    }

    return this.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get invites created by a specific user
   */
  async getInvitesByCreator(createdBy: string): Promise<Invite[]> {
    this.logQuery("getInvitesByCreator", { createdBy });
    return this.findMany({
      where: { createdBy },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Create a new invite
   */
  async createInvite(data: {
    email: string;
    role: Role;
    createdBy: string;
    expiresAt: Date;
    token?: string;
  }): Promise<Invite> {
    this.logQuery("createInvite", data);
    return this.create({
      data: {
        email: data.email,
        role: data.role,
        createdBy: data.createdBy,
        expiresAt: data.expiresAt,
        token: data.token, // Will use default cuid() if not provided
      },
    });
  }

  /**
   * Mark invite as used
   */
  async markAsUsed(token: string): Promise<Invite> {
    this.logQuery("markAsUsed", { token });
    return this.update({
      where: { token },
      data: { usedAt: new Date() },
    });
  }

  /**
   * Delete invite by token
   */
  async deleteByToken(token: string): Promise<Invite> {
    this.logQuery("deleteByToken", { token });
    return this.delete({
      where: { token },
    });
  }

  /**
   * Delete expired invites (cleanup job)
   */
  async deleteExpiredInvites(): Promise<{ count: number }> {
    this.logQuery("deleteExpiredInvites", { before: new Date() });
    return this.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Delete used invites (cleanup job)
   */
  async deleteUsedInvites(): Promise<{ count: number }> {
    this.logQuery("deleteUsedInvites", {});
    return this.deleteMany({
      where: {
        usedAt: {
          not: null,
        },
      },
    });
  }

  /**
   * Check if invite is valid (exists, not used, not expired)
   */
  async isInviteValid(token: string): Promise<boolean> {
    this.logQuery("isInviteValid", { token });
    const invite = await this.findUnique<{ usedAt: Date | null; expiresAt: Date }>({
      where: { token },
      select: {
        usedAt: true,
        expiresAt: true,
      },
    });

    if (!invite) {
      return false;
    }

    if (invite.usedAt !== null) {
      return false;
    }

    if (invite.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Count pending invites (not used, not expired)
   */
  async countPendingInvites(): Promise<number> {
    this.logQuery("countPendingInvites", {});
    return this.count({
      where: {
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  /**
   * Count invites by email (all time)
   */
  async countInvitesByEmail(email: string): Promise<number> {
    this.logQuery("countInvitesByEmail", { email });
    return this.count({
      where: { email },
    });
  }
}

// Export singleton instance
export const inviteRepository = new InviteRepository();
