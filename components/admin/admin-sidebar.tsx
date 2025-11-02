"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { LayoutDashboard, Users, Activity, Settings, Shield } from "lucide-react";
import { Role } from "@prisma/client";
import { getAdminPath } from "@/lib/auth/constants";

interface AdminNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Role[];
}

const adminNavItems: AdminNavItem[] = [
  {
    title: "Overview",
    href: getAdminPath(),
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: getAdminPath("/users"),
    icon: Users,
  },
  {
    title: "Activity Logs",
    href: getAdminPath("/logs"),
    icon: Activity,
    roles: [Role.SUPER_ADMIN], // Only super admins can view logs
  },
  {
    title: "Settings",
    href: getAdminPath("/settings"),
    icon: Settings,
    roles: [Role.SUPER_ADMIN],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredItems = adminNavItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <div className="flex h-full flex-col gap-2 border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href={getAdminPath()} className="flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6" />
          <span>Admin Panel</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  isActive ? "bg-muted text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary"
        >
          <LayoutDashboard className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
