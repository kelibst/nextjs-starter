"use client";

import { useEffect, useState } from "react";
import { ActivityTable } from "@/components/admin/logs/activity-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Download, Trash2 } from "lucide-react";
import { ActivityLogWithUser } from "@/lib/repositories";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLogWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });

      if (actionFilter !== "all") {
        params.append("action", actionFilter);
      }

      const response = await fetch(`/api/admin/logs?${params}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.data.logs);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        toast.error("Failed to load activity logs");
      }
    } catch (error) {
      toast.error("Error loading logs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const handleDeleteOldLogs = async (days: number) => {
    try {
      const response = await fetch(`/api/admin/logs?olderThan=${days}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.data.message);
        fetchLogs();
      } else {
        toast.error("Failed to delete logs");
      }
    } catch (error) {
      toast.error("Error deleting logs");
    }
  };

  const handleExport = () => {
    // Export logs to CSV
    const csv = [
      ["Action", "User", "Email", "Resource", "IP Address", "Time"].join(","),
      ...logs.map((log) =>
        [
          log.action,
          log.user?.username || "Unknown",
          log.user?.email || "N/A",
          log.resource || "-",
          log.ipAddress || "unknown",
          new Date(log.createdAt).toLocaleString(),
        ]
          .map((field) => `"${field}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `activity-logs-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Logs exported successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground mt-2">
            View and manage system activity logs for security and compliance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
          <CardDescription>Filter activity logs by action type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="LOGIN_FAILED">Failed Login</SelectItem>
                  <SelectItem value="USER_CREATE">User Created</SelectItem>
                  <SelectItem value="USER_UPDATE">User Updated</SelectItem>
                  <SelectItem value="USER_DELETE">User Deleted</SelectItem>
                  <SelectItem value="PASSWORD_CHANGE">Password Change</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Retention</Label>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Old Logs
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Old Activity Logs</AlertDialogTitle>
                    <AlertDialogDescription>
                      Choose how many days of logs to keep. Older logs will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="grid gap-2 py-4">
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteOldLogs(30)}
                    >
                      Delete logs older than 30 days
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteOldLogs(90)}
                    >
                      Delete logs older than 90 days
                    </Button>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">Loading logs...</div>
      ) : (
        <>
          <ActivityTable logs={logs} />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
