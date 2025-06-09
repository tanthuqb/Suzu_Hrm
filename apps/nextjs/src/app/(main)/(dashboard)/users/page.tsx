import { Suspense } from "react";
import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import { UserStatusModal } from "~/components/Modals/UserStatusModal";
import { UserStatusModalProvider } from "~/context/UserStatusModalContext";
import { getAllDepartments } from "~/libs/data/departments";
import { getAllPositions } from "~/libs/data/positions";
import { getAllRoles } from "~/libs/data/roles";
import { getUserListFirstPageCached } from "~/libs/data/users";
import { UserTable } from "./_components/user-table";

export const dynamic = "force-dynamic";
export default async function UsersPage() {
  const { status, message } = await checkRole(["admin", "hr"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  const { users, total } = await getUserListFirstPageCached();
  const roles = await getAllRoles();
  const departments = await getAllDepartments();
  const positions = await getAllPositions();

  return (
    <Suspense fallback={<div>Đang tải trang Users...</div>}>
      <UserStatusModalProvider>
        <UserTable
          users={users}
          total={total}
          roles={roles}
          departments={departments}
          positions={positions}
        />
        <UserStatusModal />
      </UserStatusModalProvider>
    </Suspense>
  );
}
