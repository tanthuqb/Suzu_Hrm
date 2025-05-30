import { dehydrate } from "@tanstack/react-query";

import AuditLogsTable from "~/app/(main)/(dashboard)/_components/logs/audit-logs-table";
import { getQueryClient, HydrateClient, prefetch, trpc } from "~/trpc/server";

export default async function AuditLogsPage() {
  await prefetch(
    trpc.auditlog.getAll.queryOptions({
      page: 1,
      pageSize: 20,
    }),
  );

  const state = dehydrate(getQueryClient());
  return (
    <HydrateClient state={state}>
      <div className="container mx-auto py-6">
        <AuditLogsTable />
      </div>
    </HydrateClient>
  );
}
