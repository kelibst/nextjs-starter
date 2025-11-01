import bcrypt from "bcryptjs";

/**
 * Number of bcrypt salt rounds
 * 10 is a good balance between security and performance
 */
const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 *
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a bcrypt hash
 *
 * @param password - Plain text password to verify
 * @param hashedPassword - Bcrypt hashed password to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Password strength validation regex
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Check if a password meets strength requirements
 *
 * @param password - Password to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  if (!/[@$!%*?&]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character (@$!%*?&)",
    };
  }

  return { isValid: true };
}
