import { Suspense } from "react";

import { UserStatusEnum, VALID_ROLES } from "@acme/db";

import { checkRole } from "~/actions/auth";
import DashboardClientPage from "~/app/(main)/(dashboard)/_components/dashboards/page-client";
import { LoadingSpinner } from "~/components/commons/loading-spiner";
import { mergeDehydratedStates } from "~/libs";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user } = await checkRole(VALID_ROLES);

  const year = new Date().getFullYear();

  const activeQuery = trpc.user.getCountUserByStatus.queryOptions({
    status: UserStatusEnum.ACTIVE,
    year,
  });
  const suspendedQuery = trpc.user.getCountUserByStatus.queryOptions({
    status: UserStatusEnum.SUSPENDED,
    year,
  });
  const positionQuery = trpc.user.getAllUserCountsByPosition.queryOptions();
  const auditQuery = trpc.auditlog.getAll.queryOptions({
    page: 1,
    pageSize: 5,
  });

  const { state: stateActive } = await ssrPrefetch(activeQuery);
  const { state: stateSuspended } = await ssrPrefetch(suspendedQuery);
  const { state: statePosition } = await ssrPrefetch(positionQuery);
  const { state: stateAudit } = await ssrPrefetch(auditQuery);

  const mergedState = mergeDehydratedStates([
    stateActive,
    stateSuspended,
    statePosition,
    stateAudit,
  ]);

  return (
    <HydrateClient state={mergedState}>
      <div className="flex h-full w-full">
        <Suspense fallback={<LoadingSpinner />}>
          <DashboardClientPage role={user?.roleName} />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
