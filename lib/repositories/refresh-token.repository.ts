import { RefreshToken, Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { BaseRepository } from "./base.repository";

/**
 * RefreshToken with User relation
 */
export type RefreshTokenWithUser = Prisma.RefreshTokenGetPayload<{
  include: { user: true };
}>;

/**
 * Refresh Token Repository
 * Handles all refresh token-related database operations
 */
class RefreshTokenRepository extends BaseRepository<RefreshToken, typeof prisma.refreshToken> {
  protected delegate = prisma.refreshToken;
  protected modelName = "RefreshToken";

  /**
   * Find refresh token by token string
   */
  async findByToken(token: string): Promise<RefreshToken | null> {
    this.logQuery("findByToken", { token: "[REDACTED]" });
    return this.findUnique({
      where: { token },
    });
  }

  /**
   * Find refresh token by token string (with user relation)
   */
  async findByTokenWithUser(token: string): Promise<RefreshTokenWithUser | null> {
    this.logQuery("findByTokenWithUser", { token: "[REDACTED]" });
    return this.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  /**
   * Find all refresh tokens for a user
   */
  async findByUserId(userId: string): Promise<RefreshToken[]> {
    this.logQuery("findByUserId", { userId });
    return this.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Create a new refresh token
   */
  async createToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    this.logQuery("createToken", { ...data, token: "[REDACTED]" });
    return this.create({
      data: {
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });
  }

  /**
   * Delete refresh token by token string
   */
  async deleteByToken(token: string): Promise<void> {
    this.logQuery("deleteByToken", { token: "[REDACTED]" });
    await this.deleteMany({
      where: { token },
    });
  }

  /**
   * Delete refresh token by ID
   */
  async deleteById(id: string): Promise<RefreshToken> {
    this.logQuery("deleteById", { id });
    return this.delete({
      where: { id },
    });
  }

  /**
   * Delete all refresh tokens for a user
   */
  async deleteByUserId(userId: string): Promise<{ count: number }> {
    this.logQuery("deleteByUserId", { userId });
    return this.deleteMany({
      where: { userId },
    });
  }

  /**
   * Delete expired refresh tokens (cleanup job)
   */
  async deleteExpiredTokens(): Promise<{ count: number }> {
    this.logQuery("deleteExpiredTokens", { before: new Date() });
    return this.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Rotate refresh token (delete old, create new) - Atomic operation
   */
  async rotateToken(
    oldTokenId: string,
    newTokenData: {
      token: string;
      userId: string;
      expiresAt: Date;
    }
  ): Promise<RefreshToken> {
    this.logQuery("rotateToken", {
      oldTokenId,
      newToken: "[REDACTED]",
    });

    return this.transaction(async (tx) => {
      // Delete old token (using deleteMany for idempotency - won't fail if token doesn't exist)
      await tx.refreshToken.deleteMany({
        where: { id: oldTokenId },
      });

      // Create new token
      const newToken = await tx.refreshToken.create({
        data: {
          token: newTokenData.token,
          userId: newTokenData.userId,
          expiresAt: newTokenData.expiresAt,
        },
      });

      return newToken;
    });
  }

  /**
   * Count active (non-expired) tokens for a user
   */
  async countActiveTokensByUserId(userId: string): Promise<number> {
    this.logQuery("countActiveTokensByUserId", { userId });
    return this.count({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  /**
   * Check if token exists and is not expired
   */
  async isTokenValid(token: string): Promise<boolean> {
    this.logQuery("isTokenValid", { token: "[REDACTED]" });
    const refreshToken = await this.findUnique<{ expiresAt: Date }>({
      where: { token },
      select: { expiresAt: true },
    });

    if (!refreshToken) {
      return false;
    }

    return refreshToken.expiresAt > new Date();
  }
}

// Export singleton instance
export const refreshTokenRepository = new RefreshTokenRepository();
