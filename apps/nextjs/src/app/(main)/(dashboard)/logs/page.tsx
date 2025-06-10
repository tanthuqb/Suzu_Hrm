import { use } from "react";

import AuditLogsTable from "~/app/(main)/(dashboard)/_components/logs/audit-logs-table";
import { getAllAuditLogs } from "~/libs/data/auditlog";

export default function AuditLogsPage() {
  const auditLogs = use(getAllAuditLogs({ page: 1, pageSize: 20 }));
  return (
    <div className="h-full min-h-screen w-full px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Audit Logs</h1>
      <AuditLogsTable initialData={auditLogs} />
    </div>
  );
}
