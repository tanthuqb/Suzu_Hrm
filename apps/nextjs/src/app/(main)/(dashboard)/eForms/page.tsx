import React from "react";
import { redirect } from "next/navigation";

import { VALID_ROLES } from "@acme/db";

import { checkRole } from "~/actions/auth";

const eForms = async () => {
  const { status, message } = await checkRole(VALID_ROLES);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }
  return <div>eForms Page</div>;
};

export default eForms;
