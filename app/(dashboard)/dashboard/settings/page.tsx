import { AppearanceSettings } from "@/components/dashboard/settings/appearance-settings";
import { AccountSettings } from "@/components/dashboard/settings/account-settings";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-6">
        <AppearanceSettings />
        <AccountSettings />
      </div>
    </div>
  );
}
