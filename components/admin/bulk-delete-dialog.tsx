"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BulkDeleteDialogProps {
  userIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkDeleteDialog({
  userIds,
  open,
  onOpenChange,
  onSuccess,
}: BulkDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete users one by one
      // In a production app, you might want a dedicated bulk delete endpoint
      const deletePromises = userIds.map((id) =>
        fetch(`/api/users/${id}`, { method: "DELETE" })
      );

      const results = await Promise.all(deletePromises);
      const successCount = results.filter((r) => r.ok).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} user(s)`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} user(s)`);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete users");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {userIds.length} user(s)?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete {userIds.length} user
            account(s) and remove all associated data from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete {userIds.length} User(s)
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
