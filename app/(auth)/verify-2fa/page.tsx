"use client";

/**
 * Two-Factor Verification Page
 *
 * Shown after successful password login when user has 2FA enabled
 * Allows verification via TOTP token or backup code
 */

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TwoFactorInput } from "@/components/auth/two-factor-input";
import { Shield, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function VerifyTwoFactorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [code, setCode] = React.useState("");
  const [isBackupCode, setIsBackupCode] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);

  // Redirect if no userId
  React.useEffect(() => {
    if (!userId) {
      router.push("/login");
    }
  }, [userId, router]);

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code;

    if (!codeToVerify) {
      setError("Please enter a verification code");
      return;
    }

    if (!isBackupCode && codeToVerify.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: codeToVerify,
          isBackupCode,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    router.push("/login");
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <Shield className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            Two-Factor Authentication
          </h1>
          <p className="text-muted-foreground">
            Enter the verification code from your authenticator app
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verify Your Identity</CardTitle>
            <CardDescription>
              {isBackupCode
                ? "Enter one of your backup codes"
                : "Enter the 6-digit code from your authenticator app"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isBackupCode ? (
              <div className="space-y-2">
                <TwoFactorInput
                  value={code}
                  onChange={setCode}
                  onComplete={handleVerify}
                  disabled={isVerifying}
                  error={!!error}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="backup-code">Backup Code</Label>
                <Input
                  id="backup-code"
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isVerifying}
                  className={error ? "border-red-500" : ""}
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isVerifying}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
              <Button
                onClick={() => handleVerify()}
                disabled={isVerifying || !code}
                className="flex-1"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => {
                  setIsBackupCode(!isBackupCode);
                  setCode("");
                  setError("");
                }}
                className="text-sm"
              >
                {isBackupCode
                  ? "Use authenticator app instead"
                  : "Use backup code instead"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Lost access to your authenticator app?{" "}
          <Link href="/support" className="font-medium underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
