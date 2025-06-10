import { redirect } from "next/navigation";

import { UserStatusEnum, VALID_ROLES } from "@acme/db";

import { checkRole } from "~/actions/auth";
import DashboardClientPage from "~/app/(main)/(dashboard)/_components/dashboards/page-client";
import { getAllAuditLogs } from "~/libs/data/auditlog";
import { getAllUserCountsByPosition } from "~/libs/data/positions";
import { getCountUserByStatus } from "~/libs/data/users";

export default async function DashboardPage() {
  const { status, user, message } = await checkRole(VALID_ROLES);

  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  const year = new Date().getFullYear();

  const usersActive = await getCountUserByStatus(UserStatusEnum.ACTIVE, year);

  const usersSuspended = await getCountUserByStatus(
    UserStatusEnum.SUSPENDED,
    year,
  );

  const positionCounts = await getAllUserCountsByPosition(
    UserStatusEnum.ACTIVE,
  );
  const auditlogs = await getAllAuditLogs({
    page: 1,
    pageSize: 5,
  });

  return (
    <div className="flex h-full w-full">
      <DashboardClientPage
        role={user?.roleName}
        usersActive={usersActive}
        usersSuspended={usersSuspended}
        positionCounts={positionCounts}
        recentActivities={auditlogs.logs}
      />
    </div>
  );
}
