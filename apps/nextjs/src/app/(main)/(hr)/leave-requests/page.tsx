import { redirect } from "next/navigation";

import { VALID_ROLES } from "@acme/db";

import { checkRole } from "~/actions/auth";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import { LeaveRequestsTable } from "./../_components/leave-requests/leave-requests-table";

export default async function LeaveManagementPage() {
  const { status, user, message } = await checkRole(VALID_ROLES);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }
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
