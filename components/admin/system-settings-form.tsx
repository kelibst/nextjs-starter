"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

// ============================================================================
// Types & Validation
// ============================================================================

const settingsFormSchema = z.object({
  emailVerificationRequired: z.boolean(),
  twoFactorRequired: z.boolean(),
  allowSelfRegistration: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SystemSettingsFormProps {
  initialSettings: SettingsFormValues;
}

// ============================================================================
// Component
// ============================================================================

export function SystemSettingsForm({ initialSettings }: SystemSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: initialSettings,
  });

  const { register, handleSubmit, watch, setValue } = form;
  const watchedSettings = watch();

  async function onSubmit(values: SettingsFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update settings"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Authentication Settings</CardTitle>
          <CardDescription>
            Configure how users authenticate and register on your platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Verification */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="emailVerificationRequired">
                Email Verification Required
              </Label>
              <p className="text-sm text-muted-foreground">
                Require users to verify their email address before they can use the
                platform. Note: Requires RESEND_API_KEY to be configured.
              </p>
            </div>
            <Switch
              id="emailVerificationRequired"
              checked={watchedSettings.emailVerificationRequired}
              onCheckedChange={(checked: boolean) =>
                setValue("emailVerificationRequired", checked)
              }
            />
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="twoFactorRequired">
                Two-Factor Authentication Required
              </Label>
              <p className="text-sm text-muted-foreground">
                Require all users to enable two-factor authentication (2FA) for
                enhanced security.
              </p>
            </div>
            <Switch
              id="twoFactorRequired"
              checked={watchedSettings.twoFactorRequired}
              onCheckedChange={(checked: boolean) =>
                setValue("twoFactorRequired", checked)
              }
            />
          </div>

          {/* Self Registration */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="allowSelfRegistration">
                Allow Self-Registration
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow users to create their own accounts. Disable to make
                registration invite-only.
              </p>
            </div>
            <Switch
              id="allowSelfRegistration"
              checked={watchedSettings.allowSelfRegistration}
              onCheckedChange={(checked: boolean) =>
                setValue("allowSelfRegistration", checked)
              }
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
