import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import { getAllAttendances } from "~/libs/data/attendances";
import { AttendancesTable } from "../_components/attendances/attendance-table";

export default async function LeaveManagementPage() {
  const { status, message } = await checkRole(["admin", "hr", "manager"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  const attendances = await getAllAttendances({
    page: 1,
    pageSize: 20,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý nghỉ phép</h1>
        <p className="text-muted-foreground">
          Danh sách các đơn xin nghỉ phép của nhân viên
        </p>
      </div>
      <AttendancesTable initialData={attendances} />
    </div>
  );
}
