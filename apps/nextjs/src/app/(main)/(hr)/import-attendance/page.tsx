import React from "react";
import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import ImportPage from "../_components/imports/imports-client";

export const page = async () => {
  const { status, message } = await checkRole(["admin"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }
  return <ImportPage />;
};
