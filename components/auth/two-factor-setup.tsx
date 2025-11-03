"use client";

/**
 * TwoFactorSetup Component
 *
 * Handles the complete 2FA setup flow:
 * 1. Generate QR code and secret
 * 2. Display QR code for scanning
 * 3. Show manual entry secret (if QR scan fails)
 * 4. Verify TOTP token to enable 2FA
 * 5. Display backup codes after enabling
 */

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TwoFactorInput } from "./two-factor-input";
import { Shield, Copy, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";

interface TwoFactorSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

type SetupStep = "loading" | "scan" | "verify" | "backup-codes";

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = React.useState<SetupStep>("loading");
  const [qrCode, setQrCode] = React.useState<string>("");
  const [secret, setSecret] = React.useState<string>("");
  const [secretFormatted, setSecretFormatted] = React.useState<string>("");
  const [verificationCode, setVerificationCode] = React.useState<string>("");
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string>("");
  const [isVerifying, setIsVerifying] = React.useState(false);

  // Fetch QR code on mount
  React.useEffect(() => {
    fetchSetupData();
  }, []);

  const fetchSetupData = async () => {
    try {
      const response = await fetch("/api/users/me/2fa/setup", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate 2FA setup");
      }

      setQrCode(data.data.qrCode);
      setSecret(data.data.secret);
      setSecretFormatted(data.data.secretFormatted);
      setStep("scan");
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to generate 2FA setup");
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/users/me/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          token: verificationCode,
          secret: secret,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setBackupCodes(data.data.backupCodes);
      setStep("backup-codes");
      toast.success("Two-factor authentication enabled!");
    } catch (err: any) {
      setError(err.message);
      setVerificationCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success("Secret copied to clipboard");
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    toast.success("Backup codes copied to clipboard");
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "2fa-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Backup codes downloaded");
  };

  if (step === "loading") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Setting up Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Generating your QR code...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (step === "scan") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Scan QR Code
          </CardTitle>
          <CardDescription>
            Scan this QR code with your authenticator app (Google Authenticator,
            Authy, Microsoft Authenticator, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            {qrCode && (
              <div className="bg-white p-4 rounded-lg">
                <Image
                  src={qrCode}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                  className="rounded"
                />
              </div>
            )}

            {/* Manual Entry */}
            <div className="w-full">
              <p className="text-sm font-medium mb-2">
                Can't scan? Enter this code manually:
              </p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md font-mono text-sm">
                <code className="flex-1">{secretFormatted}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copySecret}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setStep("verify")}
              className="flex-1"
            >
              I've Scanned It
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "verify") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verify Setup
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app to complete setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <TwoFactorInput
              value={verificationCode}
              onChange={setVerificationCode}
              onComplete={handleVerify}
              disabled={isVerifying}
              error={!!error}
            />
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep("scan")}
              disabled={isVerifying}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleVerify}
              disabled={isVerifying || verificationCode.length !== 6}
              className="flex-1"
            >
              {isVerifying ? "Verifying..." : "Verify & Enable"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "backup-codes") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Backup Codes
          </CardTitle>
          <CardDescription>
            Save these backup codes in a safe place. Each code can only be used
            once if you lose access to your authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Store these codes securely. You won't
              be able to see them again!
            </AlertDescription>
          </Alert>

          {/* Backup Codes Grid */}
          <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-md font-mono text-sm">
            {backupCodes.map((code, index) => (
              <div key={index} className="p-2 bg-background rounded border">
                {code}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={copyBackupCodes}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Codes
            </Button>
            <Button
              variant="outline"
              onClick={downloadBackupCodes}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <Button onClick={onComplete} className="w-full">
            I've Saved My Backup Codes
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
