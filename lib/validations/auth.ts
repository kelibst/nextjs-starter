import { z } from "zod";
import { PASSWORD_REGEX } from "@/lib/auth/password";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, "Email or username is required")
    .transform((val) => val.trim()),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema
 */
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
      .transform((val) => val.trim().toLowerCase()),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .transform((val) => val.trim().toLowerCase()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        PASSWORD_REGEX,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Password change form validation schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        PASSWORD_REGEX,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
