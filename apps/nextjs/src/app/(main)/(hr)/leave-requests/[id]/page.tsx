import { checkAuth } from "~/actions/auth";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import { LeaveRequestsTable } from "../../_components/leave-requests/leave-requests-table";

export default async function LeaveRequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const AuthUser = await checkAuth();

  const { user } = AuthUser;
  const { id } = params;
  const { state } = await ssrPrefetch(trpc.leaveRequest.getAll.queryOptions());

  return (
    <HydrateClient state={state}>
      <div className="container mx-auto space-y-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Leave Request Detail
        </h1>
        <LeaveRequestsTable
          userId={user?.id!}
          leaveRequestId={id}
          currentUserRole={user?.roleName}
        />
      </div>
    </HydrateClient>
  );
}
