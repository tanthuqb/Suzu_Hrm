import React from "react";
import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import ImportUserPage from "./../_components/imports/imports-users";

export default async function Page() {
  const { status, message } = await checkRole(["admin"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }
  return <ImportUserPage />;
}
