import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          View, search, edit, and manage all user accounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users Table</CardTitle>
          <CardDescription>
            User management table with search, filter, and CRUD operations will be implemented in the next phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                The user management table with search, filtering, pagination, and CRUD operations
                will be implemented in Phase 4 of the admin panel development.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
