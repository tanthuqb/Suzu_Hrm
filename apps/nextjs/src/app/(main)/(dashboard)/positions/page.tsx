import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import { getAllDepartments } from "~/libs/data/departments";
import { getAllPositions } from "~/libs/data/positions";
import { PositionsTable } from "../_components/positions/positions-table";

export default async function PositionsPage() {
  const { status, message } = await checkRole(["admin"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  const positions = await getAllPositions();
  const departments = await getAllDepartments();
  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Positions</h1>
      <PositionsTable positions={positions} departments={departments} />
    </div>
  );
}
