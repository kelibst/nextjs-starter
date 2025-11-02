"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "@/components/admin/users-table";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { DeleteUserDialog } from "@/components/admin/delete-user-dialog";
import { BulkDeleteDialog } from "@/components/admin/bulk-delete-dialog";
import { InviteUserDialog } from "@/components/admin/invite-user-dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
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

  // Dialog states
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

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
    setEditUser(user);
  };

  const handleDelete = (user: User) => {
    setDeleteUser(user);
  };

  const handleBulkDelete = (userIds: string[]) => {
    setBulkDeleteIds(userIds);
  };

  const handleSuccess = () => {
    fetchUsers(); // Refresh the user list
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            View, search, and manage all user accounts.
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
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

      {/* Edit User Dialog */}
      <EditUserDialog
        user={editUser}
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        onSuccess={handleSuccess}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        user={deleteUser}
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
        onSuccess={handleSuccess}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        userIds={bulkDeleteIds}
        open={bulkDeleteIds.length > 0}
        onOpenChange={(open) => !open && setBulkDeleteIds([])}
        onSuccess={handleSuccess}
      />

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
