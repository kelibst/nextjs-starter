import { z } from "zod";
import { Role } from "@prisma/client";

/**
 * Update user profile schema
 */
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .transform((val) => val.trim().toLowerCase())
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .transform((val) => val.trim().toLowerCase())
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Admin update user schema (includes role)
 */
export const adminUpdateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .transform((val) => val.trim().toLowerCase())
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .transform((val) => val.trim().toLowerCase())
    .optional(),
  role: z.nativeEnum(Role).optional(),
});

export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;

/**
 * User ID parameter schema
 */
export const userIdSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

export type UserIdInput = z.infer<typeof userIdSchema>;
