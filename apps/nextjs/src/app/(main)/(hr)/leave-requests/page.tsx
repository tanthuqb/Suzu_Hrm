import { redirect } from "next/navigation";

import { VALID_ROLES } from "@acme/db";

import { checkRole } from "~/actions/auth";
import { getAllLeaveRequests } from "~/libs/data/leaverequest";
import { LeaveRequestsTable } from "./../_components/leave-requests/leave-requests-table";

export default async function LeaveManagementPage() {
  const { status, user, message } = await checkRole(VALID_ROLES);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  const leaveRequests = await getAllLeaveRequests({
    userId: user?.id,
  });

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý nghỉ phép</h1>
        <p className="text-muted-foreground">
          Xem, Tìm kiếm và quản lý nghỉ phép
        </p>
      </div>
      <LeaveRequestsTable
        userId={user?.id!}
        currentUserRole={user?.roleName}
        initialData={leaveRequests}
      />
    </div>
  );
}
