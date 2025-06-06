import AuditLogsTable from "~/app/(main)/(dashboard)/_components/logs/audit-logs-table";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";

export const dynamic = "force-dynamic";

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
        <h1 className="mb-4 text-2xl font-bold">Audit Logs</h1>
        <AuditLogsTable />
      </div>
    </HydrateClient>
  );
}
