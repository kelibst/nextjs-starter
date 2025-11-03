"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OAuthButtons, OAuthDivider } from "@/components/auth/oauth-buttons";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface LoginFormProps {
  showPassword?: boolean;
  showGoogle?: boolean;
  showGithub?: boolean;
}

export function LoginForm({
  showPassword = true,
  showGoogle = false,
  showGithub = false,
}: LoginFormProps) {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showOAuth = showGoogle || showGithub;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.emailOrUsername, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* OAuth Buttons */}
          {showOAuth && (
            <OAuthButtons
              showGoogle={showGoogle}
              showGithub={showGithub}
              disabled={isLoading}
            />
          )}

          {/* Divider */}
          {showOAuth && showPassword && <OAuthDivider />}

          {/* Password Login Form */}
          {showPassword && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">Email or Username</Label>
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="admin or admin@example.com"
                  {...register("emailOrUsername")}
                  disabled={isLoading}
                />
                {errors.emailOrUsername && (
                  <p className="text-sm text-destructive">{errors.emailOrUsername.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          )}

          {/* No auth methods enabled */}
          {!showOAuth && !showPassword && (
            <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
              No authentication methods are currently enabled. Please contact the administrator.
            </div>
          )}

          {/* Sign up link */}
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
