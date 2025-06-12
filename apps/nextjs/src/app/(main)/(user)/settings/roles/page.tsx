import React from "react";
import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import { getAllRoles } from "~/libs/data/roles";
import RoleManager from "../_components/role-table";

export default async function PageRolesManagers() {
  const { status, message } = await checkRole(["admin"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }
  const roles = await getAllRoles();

  return <RoleManager roles={roles} />;
}
