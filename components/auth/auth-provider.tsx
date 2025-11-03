"use client";

import { createContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SessionUser } from "@/lib/auth/session";

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Refresh access token using refresh token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
      });

      if (response.ok) {
        // Token refreshed successfully - fetch user data
        const userResponse = await fetch("/api/auth/me");
        if (userResponse.ok) {
          const data = await userResponse.json();
          setUser(data.data.user);
          return true;
        }
      }

      // Refresh failed - logout user
      setUser(null);
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      setUser(null);
      return false;
    }
  }, []);

  // Fetch current user on mount
  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else if (response.status === 401) {
        // Unauthorized - try to refresh token
        const refreshed = await refreshToken();
        if (!refreshed) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Proactive token refresh - refresh every 10 minutes (before 15min expiration)
  useEffect(() => {
    if (!user) return;

    // Refresh token every 10 minutes to prevent expiration
    // Access tokens expire in 15 minutes, so this keeps them fresh
    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 10 * 60 * 1000); // 10 minutes in milliseconds

    return () => clearInterval(refreshInterval);
  }, [user, refreshToken]);

  // Login function
  const login = async (emailOrUsername: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUsername, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Check if 2FA is required
    if (data.data.requiresTwoFactor) {
      // Redirect to 2FA verification page with userId
      router.push(`/verify-2fa?userId=${data.data.userId}`);
      return;
    }

    setUser(data.data.user);

    // Smart redirect based on user role and intended destination
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    const userRole = data.data.user.role;

    // If user was trying to go somewhere specific
    if (from && from !== "/login" && from !== "/register") {
      // Check if it's an admin route
      if (from.startsWith("/admin")) {
        // Only redirect to admin if user has permission
        if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
          router.push(from);
          return;
        }
        // User doesn't have admin access, go to dashboard
        router.push("/dashboard");
        return;
      }
      // Non-admin route - redirect there
      router.push(from);
      return;
    }

    // No 'from' param - use role-based default
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  // Register function
  const register = async (
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    setUser(data.data.user);

    // Check for redirect destination
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");

    // If user was trying to go somewhere specific (non-auth page)
    if (from && from !== "/login" && from !== "/register") {
      router.push(from);
      return;
    }

    // Default: new users always go to dashboard
    router.push("/dashboard");
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    router.push("/login");
  };

  // Refresh user data
  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
