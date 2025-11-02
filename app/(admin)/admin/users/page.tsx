"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "@/components/admin/users-table";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();

      if (response.ok) {
        setUsers(data.data.users);
      } else {
        setError(data.error || "Failed to load users");
        toast.error(data.error || "Failed to load users");
      }
    } catch (err) {
      setError("Failed to load users");
      toast.error("Failed to load users");
      console.error("Users fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (user: User) => {
    // Will be implemented in Phase 5
    toast.info(`Edit user: ${user.username} (Coming in Phase 5)`);
  };

  const handleDelete = (user: User) => {
    // Will be implemented in Phase 5
    toast.info(`Delete user: ${user.username} (Coming in Phase 5)`);
  };

  const handleBulkDelete = (userIds: string[]) => {
    // Will be implemented in Phase 5
    toast.info(`Bulk delete ${userIds.length} users (Coming in Phase 5)`);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          View, search, and manage all user accounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
          <CardDescription>
            Search, filter, and manage user accounts. Edit roles or delete users as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBulkDelete={handleBulkDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
