import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import { PositionsTable } from "../_components/positions/positions-table";

export default async function PositionsPage() {
  const { status, message } = await checkRole(["admin"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }
  const { state: statePostion } = await ssrPrefetch(
    trpc.position.getAll.queryOptions(),
  );
  const { state: stateDepartment } = await ssrPrefetch(
    trpc.department.getAll.queryOptions(),
  );
  const mergedState = {
    ...statePostion,
    ...stateDepartment,
  };

  return (
    <HydrateClient state={mergedState}>
      <div className="container py-10">
        <h1 className="mb-6 text-3xl font-bold">Positions</h1>
        <PositionsTable />
      </div>
    </HydrateClient>
  );
}
