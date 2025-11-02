"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Database, Server, Shield, Clock } from "lucide-react";
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

export default function AdminSettingsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleClearAllLogs = async () => {
    try {
      const response = await fetch("/api/admin/logs?all=true", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.data.message);
      } else {
        toast.error("Failed to clear logs");
      }
    } catch (error) {
      toast.error("Error clearing logs");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground mt-2">
          System configuration and maintenance settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Information
            </CardTitle>
            <CardDescription>Current system status and statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <Label className="text-muted-foreground">Total Users</Label>
                  <Badge variant="secondary">{stats?.totalUsers || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-muted-foreground">Users Today</Label>
                  <Badge variant="default">{stats?.usersToday || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-muted-foreground">Database</Label>
                  <Badge variant="outline">PostgreSQL</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-muted-foreground">Version</Label>
                  <Badge variant="outline">1.0.0</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Configuration
            </CardTitle>
            <CardDescription>Authentication and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-muted-foreground">Access Token TTL</Label>
              <Badge variant="secondary">15 minutes</Badge>
            </div>
            <div className="flex justify-between items-center">
              <Label className="text-muted-foreground">Refresh Token TTL</Label>
              <Badge variant="secondary">7 days</Badge>
            </div>
            <div className="flex justify-between items-center">
              <Label className="text-muted-foreground">Password Hashing</Label>
              <Badge variant="outline">bcrypt (10 rounds)</Badge>
            </div>
            <div className="flex justify-between items-center">
              <Label className="text-muted-foreground">JWT Algorithm</Label>
              <Badge variant="outline">HS256</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Log Settings
            </CardTitle>
            <CardDescription>Configure activity log retention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Retention Period</Label>
              <p className="text-sm text-muted-foreground">
                Activity logs are stored indefinitely by default. You can manually delete old logs from the Activity Logs page.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Logged Actions</Label>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">Login/Logout</Badge>
                <Badge variant="outline" className="text-xs">User CRUD</Badge>
                <Badge variant="outline" className="text-xs">Role Changes</Badge>
                <Badge variant="outline" className="text-xs">Password Changes</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Clear All Activity Logs</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Permanently delete all activity logs from the database. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Clear All Logs
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all activity logs from the database.
                      This action cannot be undone and may affect compliance requirements.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAllLogs}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, Delete All Logs
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
