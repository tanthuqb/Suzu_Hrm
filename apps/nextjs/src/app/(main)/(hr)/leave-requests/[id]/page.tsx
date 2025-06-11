import { checkAuth } from "~/actions/auth";
import { getLeaveRequestById } from "~/libs/data/leaverequest";
import { LeaveRequestsTable } from "../../_components/leave-requests/leave-requests-table";

export default async function LeaveRequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const AuthUser = await checkAuth();

  const { user } = AuthUser;
  const { id } = await params;
  const leaveRequest = await getLeaveRequestById(id);

  return (
    <div className="container mx-auto space-y-6 py-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Leave Request Detail
      </h1>
      <LeaveRequestsTable
        userId={user?.id!}
        leaveRequest={leaveRequest}
        currentUserRole={user?.roleName}
      />
    </div>
  );
}
