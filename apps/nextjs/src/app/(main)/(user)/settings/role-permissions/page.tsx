import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import { getAllActions } from "~/libs/data/permisions";
import { getAllRoles } from "~/libs/data/roles";
import Permissions from "../_components/Permission-Client";

export default async function PermissionsPage() {
  const { status, message } = await checkRole(["admin", "hr"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }
  const roles = await getAllRoles();
  const permissions = await getAllActions();

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Permission Management</h1>
      <p className="mb-8 text-muted-foreground">
        Cấu hình quyền truy cập cho người dùng trong ứng dụng của bạn. Bạn có
        thể cấu hình quyền truy cập cho từng người dùng hoặc nhóm người dùng.
      </p>
      <Permissions roles={roles} permissions={permissions} />
    </div>
  );
}
