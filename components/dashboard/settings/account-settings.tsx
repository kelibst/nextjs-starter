"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { User, Mail, Shield, Calendar } from "lucide-react";

/**
 * Account Settings Component
 *
 * Displays read-only account information including:
 * - Username
 * - Email
 * - Role
 * - Account creation date
 */
export function AccountSettings() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "destructive";
      case "ADMIN":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Admin";
      default:
        return "User";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>
          View your account details. To update your profile information, visit the Profile page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Username
            </Label>
            <p className="text-sm font-medium">{user.username}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <p className="text-sm font-medium">{user.email}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role
            </Label>
            <div>
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Member Since
            </Label>
            <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
