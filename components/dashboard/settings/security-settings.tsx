"use client";

/**
 * SecuritySettings Component
 *
 * Manages security-related settings:
 * - Two-Factor Authentication (enable/disable)
 * - View security logs (optional)
 * - Password change (link to profile page)
 */

import * as React from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import { useAuth } from "@/lib/hooks/use-auth";
import { Shield, Check, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function SecuritySettings() {
  const { user, refreshUser } = useAuth();
  const [isSetupOpen, setIsSetupOpen] = React.useState(false);
  const [isDisableOpen, setIsDisableOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [isDisabling, setIsDisabling] = React.useState(false);

  const handleEnableTwoFactor = () => {
    setIsSetupOpen(true);
  };

  const handleSetupComplete = async () => {
    setIsSetupOpen(false);
    await refreshUser(); // Refresh user data to show 2FA enabled
    toast.success("Two-factor authentication is now enabled!");
  };

  const handleDisableTwoFactor = async () => {
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setIsDisabling(true);

    try {
      const response = await fetch("/api/users/me/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to disable 2FA");
      }

      toast.success("Two-factor authentication disabled");
      setIsDisableOpen(false);
      setPassword("");
      await refreshUser(); // Refresh user data
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings and two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium">
                    Two-Factor Authentication
                  </Label>
                  {user?.twoFactorEnabled ? (
                    <Badge
                      variant="default"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <X className="h-3 w-3 mr-1" />
                      Disabled
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.twoFactorEnabled
                    ? "Your account is protected with 2FA"
                    : "Add an extra layer of security to your account"}
                </p>
              </div>

              {user?.twoFactorEnabled ? (
                <Button
                  variant="destructive"
                  onClick={() => setIsDisableOpen(true)}
                >
                  Disable
                </Button>
              ) : (
                <Button onClick={handleEnableTwoFactor}>Enable</Button>
              )}
            </div>

            {user?.twoFactorEnabled && (
              <div className="flex items-start gap-2 p-3 bg-muted rounded-md text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  You'll need your authenticator app to sign in. Keep your
                  backup codes in a safe place.
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Password Change Link */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Password</Label>
                <p className="text-sm text-muted-foreground">
                  Change your password regularly to keep your account secure
                </p>
              </div>
              <Button variant="outline" asChild>
                <a href="/dashboard/profile">Change Password</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <DialogContent className="sm:max-w-md">
          <TwoFactorSetup
            onComplete={handleSetupComplete}
            onCancel={() => setIsSetupOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={isDisableOpen} onOpenChange={setIsDisableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to disable two-factor authentication. This
              will make your account less secure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isDisabling}
                placeholder="Enter your password"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDisableOpen(false);
                  setPassword("");
                }}
                disabled={isDisabling}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisableTwoFactor}
                disabled={isDisabling || !password}
                className="flex-1"
              >
                {isDisabling ? "Disabling..." : "Disable 2FA"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
