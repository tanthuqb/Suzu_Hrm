import { Suspense } from "react";

import AuditLogsTable from "~/app/(main)/(dashboard)/_components/logs/audit-logs-table";
import { LoadingSpinner } from "~/components/commons/loading-spiner";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";

export default async function AuditLogsPage() {
  const { state } = await ssrPrefetch(
    trpc.auditlog.getAll.queryOptions({
      page: 1,
      pageSize: 20,
    }),
  );
  return (
    <HydrateClient state={state}>
      <div className="h-full min-h-screen w-full px-4 py-6">
        <Suspense fallback={<LoadingSpinner />}>
          <h1 className="mb-4 text-2xl font-bold">Audit Logs</h1>
          <AuditLogsTable />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
