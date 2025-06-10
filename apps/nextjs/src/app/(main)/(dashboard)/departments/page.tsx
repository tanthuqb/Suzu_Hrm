import React from "react";
import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import DepartmentsPage from "~/app/(main)/(dashboard)/_components/departments/department";
import { getAllDepartments } from "~/libs/data/departments";

const Page = async () => {
  const { status, message } = await checkRole(["admin", "hr"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  const departments = await getAllDepartments();

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Phòng Ban</h1>
      <DepartmentsPage departments={departments} />
    </div>
  );
};

export default Page;
