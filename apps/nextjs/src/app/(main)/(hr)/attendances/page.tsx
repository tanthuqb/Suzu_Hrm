import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import { AttendancesTable } from "../_components/attendances/attendance-table";

export default async function LeaveManagementPage() {
  const { status, message } = await checkRole(["admin", "hr", "manager"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  const { state } = await ssrPrefetch(trpc.attendance.getAll.queryOptions());

  return (
    <HydrateClient state={state}>
      <AttendancesTable />
    </HydrateClient>
  );
}
