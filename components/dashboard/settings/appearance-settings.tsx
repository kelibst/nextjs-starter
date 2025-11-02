"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Moon, Sun, Monitor } from "lucide-react";

/**
 * Appearance Settings Component
 *
 * Allows users to select their preferred theme (Light, Dark, or System).
 * Changes are saved automatically to localStorage via next-themes.
 */
export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how the application looks on your device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Theme</Label>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-3 gap-4"
          >
            <Label
              htmlFor="light"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="light" id="light" className="sr-only" />
              <Sun className="mb-3 h-6 w-6" />
              <span className="text-sm font-medium">Light</span>
            </Label>

            <Label
              htmlFor="dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="dark" id="dark" className="sr-only" />
              <Moon className="mb-3 h-6 w-6" />
              <span className="text-sm font-medium">Dark</span>
            </Label>

            <Label
              htmlFor="system"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="system" id="system" className="sr-only" />
              <Monitor className="mb-3 h-6 w-6" />
              <span className="text-sm font-medium">System</span>
            </Label>
          </RadioGroup>
          <p className="text-sm text-muted-foreground mt-2">
            Select your theme preference. System theme automatically switches between light and dark based on your device settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
