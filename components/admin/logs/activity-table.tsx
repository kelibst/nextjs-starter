"use client";

import { formatDistanceToNow } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActivityLogWithUser } from "@/lib/repositories";

interface ActivityTableProps {
  logs: ActivityLogWithUser[];
}

export function ActivityTable({ logs }: ActivityTableProps) {
  const getActionBadgeVariant = (action: string) => {
    if (action.includes("DELETE")) return "destructive";
    if (action.includes("CREATE")) return "default";
    if (action.includes("UPDATE")) return "secondary";
    if (action.includes("LOGIN")) return "outline";
    return "secondary";
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No activity logs found.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <Badge variant={getActionBadgeVariant(log.action)}>
                  {formatAction(log.action)}
                </Badge>
              </TableCell>
              <TableCell>
                {log.user ? (
                  <div className="flex flex-col">
                    <span className="font-medium">{log.user.username}</span>
                    <span className="text-xs text-muted-foreground">{log.user.email}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">Unknown</span>
                )}
              </TableCell>
              <TableCell>
                {log.resource ? (
                  <div className="flex flex-col">
                    <span className="capitalize">{log.resource}</span>
                    {log.resourceId && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {log.resourceId.substring(0, 8)}...
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {log.ipAddress || "unknown"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(log.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
