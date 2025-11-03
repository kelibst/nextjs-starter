import { User, Role, Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { BaseRepository } from "./base.repository";

/**
 * User without password field (safe for API responses)
 */
export type SafeUser = Omit<User, "password">;

/**
 * User Repository
 * Handles all user-related database operations
 * Automatically excludes password field from all queries
 */
class UserRepository extends BaseRepository<User, typeof prisma.user> {
  protected delegate = prisma.user;
  protected modelName = "User";

  /**
   * Safe user select (excludes password and sensitive tokens)
   */
  private readonly safeUserSelect = {
    id: true,
    username: true,
    email: true,
    role: true,
    emailVerified: true,
    twoFactorEnabled: true,
    googleId: true,
    githubId: true,
    avatarUrl: true,
    registrationMethod: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  /**
   * Find user by ID (without password)
   */
  async findById(id: string): Promise<SafeUser | null> {
    this.logQuery("findById", { id });
    return this.findUnique({
      where: { id },
      select: this.safeUserSelect,
    });
  }

  /**
   * Find user by ID (with password - use carefully!)
   * Only use for authentication purposes
   */
  async findByIdWithPassword(id: string): Promise<User | null> {
    this.logQuery("findByIdWithPassword", { id });
    return this.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email (without password)
   */
  async findByEmail(email: string): Promise<SafeUser | null> {
    this.logQuery("findByEmail", { email });
    return this.findUnique({
      where: { email },
      select: this.safeUserSelect,
    });
  }

  /**
   * Find user by email (with password - use for authentication only!)
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    this.logQuery("findByEmailWithPassword", { email });
    return this.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by username (without password)
   */
  async findByUsername(username: string): Promise<SafeUser | null> {
    this.logQuery("findByUsername", { username });
    return this.findUnique({
      where: { username },
      select: this.safeUserSelect,
    });
  }

  /**
   * Find user by username (with password - use for authentication only!)
   */
  async findByUsernameWithPassword(username: string): Promise<User | null> {
    this.logQuery("findByUsernameWithPassword", { username });
    return this.findUnique({
      where: { username },
    });
  }

  /**
   * Find user by email OR username (with password - for login)
   */
  async findByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    this.logQuery("findByEmailOrUsername", { emailOrUsername });
    return this.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string): Promise<boolean> {
    this.logQuery("usernameExists", { username });
    const user = await this.findUnique({
      where: { username },
      select: { id: true },
    });
    return user !== null;
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    this.logQuery("emailExists", { email });
    const user = await this.findUnique({
      where: { email },
      select: { id: true },
    });
    return user !== null;
  }

  /**
   * Create a new user
   */
  async createUser(data: {
    username?: string | null;
    email: string;
    password?: string | null;
    role?: Role;
    googleId?: string | null;
    githubId?: string | null;
    avatarUrl?: string | null;
    emailVerified?: boolean;
    registrationMethod?: string;
  }): Promise<SafeUser> {
    this.logQuery("createUser", { ...data, password: data.password ? "[REDACTED]" : null });
    const user = await this.create<User>({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role || Role.USER,
        googleId: data.googleId,
        githubId: data.githubId,
        avatarUrl: data.avatarUrl,
        emailVerified: data.emailVerified,
        registrationMethod: data.registrationMethod,
      },
    });

    // Remove password before returning
    const { password: _, ...safeUser } = user;
    return safeUser as SafeUser;
  }

  /**
   * Update user by ID
   */
  async updateUser(
    id: string,
    data: Partial<Pick<User, "username" | "email" | "role" | "password">>
  ): Promise<SafeUser> {
    this.logQuery("updateUser", {
      id,
      data: { ...data, password: data.password ? "[REDACTED]" : undefined },
    });

    const user = await this.delegate.update({
      where: { id },
      data,
    });

    // Remove password before returning
    const { password: _, ...safeUser } = user;
    return safeUser as SafeUser;
  }

  /**
   * Delete user by ID
   */
  async deleteUser(id: string): Promise<SafeUser> {
    this.logQuery("deleteUser", { id });
    const user = await this.delete<User>({
      where: { id },
    });

    // Remove password before returning
    const { password: _, ...safeUser } = user;
    return safeUser as SafeUser;
  }

  /**
   * Get all users (without passwords)
   */
  async getAllUsers(options?: {
    where?: Prisma.UserWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<SafeUser[]> {
    this.logQuery("getAllUsers", options);
    return this.findMany({
      where: options?.where,
      select: this.safeUserSelect,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy,
    });
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: Role): Promise<SafeUser[]> {
    this.logQuery("getUsersByRole", { role });
    return this.findMany({
      where: { role },
      select: this.safeUserSelect,
    });
  }

  /**
   * Count total users
   */
  async countUsers(where?: Prisma.UserWhereInput): Promise<number> {
    this.logQuery("countUsers", { where });
    return this.count({ where });
  }

  /**
   * Group users by role with counts
   */
  async getUserCountsByRole(): Promise<{ role: Role; _count: { role: number } }[]> {
    this.logQuery("getUserCountsByRole", {});
    return (prisma.user as any).groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    });
  }

  /**
   * Get recent users
   */
  async getRecentUsers(limit: number = 5): Promise<SafeUser[]> {
    this.logQuery("getRecentUsers", { limit });
    return this.findMany({
      select: this.safeUserSelect,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get users created after a specific date
   */
  async getUsersCreatedAfter(date: Date): Promise<number> {
    this.logQuery("getUsersCreatedAfter", { date });
    return this.count({
      where: {
        createdAt: {
          gte: date,
        },
      },
    });
  }

  /**
   * Find user by verification token (with all fields)
   */
  async findByVerificationToken(token: string): Promise<User | null> {
    this.logQuery("findByVerificationToken", { token: "[REDACTED]" });
    return this.findUnique({
      where: { verificationToken: token },
    });
  }

  /**
   * Find user by password reset token (with all fields)
   */
  async findByPasswordResetToken(token: string): Promise<User | null> {
    this.logQuery("findByPasswordResetToken", { token: "[REDACTED]" });
    return this.findUnique({
      where: { passwordResetToken: token },
    });
  }

  /**
   * Update user (generic update method)
   */
  async updateById(
    id: string,
    data: Partial<Prisma.UserUpdateInput>
  ): Promise<SafeUser> {
    this.logQuery("updateById", {
      id,
      data: { ...data, password: data.password ? "[REDACTED]" : undefined },
    });

    const user = await this.delegate.update({
      where: { id },
      data,
    });

    // Remove password before returning
    const { password: _, ...safeUser } = user;
    return safeUser as SafeUser;
  }

  /**
   * Get user's 2FA secret (with twoFactorSecret field)
   * Use only for 2FA verification
   */
  async getTwoFactorSecret(userId: string): Promise<string | null> {
    this.logQuery("getTwoFactorSecret", { userId });
    const user = await this.delegate.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });
    return user?.twoFactorSecret || null;
  }

  /**
   * Get user's backup codes (with backupCodes field)
   * Use only for backup code verification
   */
  async getBackupCodes(userId: string): Promise<string[]> {
    this.logQuery("getBackupCodes", { userId });
    const user = await this.delegate.findUnique({
      where: { id: userId },
      select: { backupCodes: true },
    });
    return user?.backupCodes || [];
  }

  /**
   * Enable 2FA for user
   */
  async enableTwoFactor(
    userId: string,
    secret: string,
    backupCodes: string[]
  ): Promise<SafeUser> {
    this.logQuery("enableTwoFactor", { userId, secret: "[REDACTED]" });
    return this.updateById(userId, {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      backupCodes: backupCodes,
    });
  }

  /**
   * Disable 2FA for user
   */
  async disableTwoFactor(userId: string): Promise<SafeUser> {
    this.logQuery("disableTwoFactor", { userId });
    return this.updateById(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: [],
    });
  }

  /**
   * Remove a used backup code
   */
  async removeBackupCode(userId: string, codeIndex: number): Promise<void> {
    this.logQuery("removeBackupCode", { userId, codeIndex });
    const codes = await this.getBackupCodes(userId);
    codes.splice(codeIndex, 1);
    await this.updateById(userId, {
      backupCodes: codes,
    });
  }

  // ============================================================================
  // OAuth Methods
  // ============================================================================

  /**
   * Find user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<SafeUser | null> {
    this.logQuery("findByGoogleId", { googleId });
    return this.findUnique({
      where: { googleId },
      select: this.safeUserSelect,
    });
  }

  /**
   * Find user by GitHub ID
   */
  async findByGithubId(githubId: string): Promise<SafeUser | null> {
    this.logQuery("findByGithubId", { githubId });
    return this.findUnique({
      where: { githubId },
      select: this.safeUserSelect,
    });
  }

  /**
   * Link Google account to existing user
   */
  async linkGoogleAccount(
    userId: string,
    googleId: string,
    avatarUrl?: string
  ): Promise<SafeUser> {
    this.logQuery("linkGoogleAccount", { userId, googleId });
    return this.updateById(userId, {
      googleId,
      avatarUrl: avatarUrl || undefined,
    });
  }

  /**
   * Link GitHub account to existing user
   */
  async linkGithubAccount(
    userId: string,
    githubId: string,
    avatarUrl?: string
  ): Promise<SafeUser> {
    this.logQuery("linkGithubAccount", { userId, githubId });
    return this.updateById(userId, {
      githubId,
      avatarUrl: avatarUrl || undefined,
    });
  }

  /**
   * Unlink Google account from user
   */
  async unlinkGoogleAccount(userId: string): Promise<SafeUser> {
    this.logQuery("unlinkGoogleAccount", { userId });
    return this.updateById(userId, {
      googleId: null,
    });
  }

  /**
   * Unlink GitHub account from user
   */
  async unlinkGithubAccount(userId: string): Promise<SafeUser> {
    this.logQuery("unlinkGithubAccount", { userId });
    return this.updateById(userId, {
      githubId: null,
    });
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
