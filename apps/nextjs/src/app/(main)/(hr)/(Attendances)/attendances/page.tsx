import { checkAuth } from "~/actions/auth";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import { LeaveRequestsTable } from "./../_components/leave-requests-table";

export default async function LeaveManagementPage() {
  const AuthUser = await checkAuth();
  const { user } = AuthUser;
  const { state } = await ssrPrefetch(trpc.leaveRequest.getAll.queryOptions());

  return (
    <HydrateClient state={state}>
      <div className="container mx-auto space-y-6 py-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Leave Requests Management
          </h1>
          <p className="text-muted-foreground">
            View, search, and manage employee leave requests
          </p>
        </div>
        <LeaveRequestsTable userId={user?.id!} />
      </div>
    </HydrateClient>
  );
}
