import { UserStatusEnum, VALID_ROLES } from "@acme/db";

import { checkRole } from "~/actions/auth";
import DashboardClientPage from "~/app/(main)/(dashboard)/_components/dashboards/page-client";
import { mergeDehydratedStates } from "~/libs";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user } = await checkRole(VALID_ROLES);

  const year = new Date().getFullYear();

  const { state: stateActive } = await ssrPrefetch(
    trpc.user.getCountUserByStatus.queryOptions({
      status: UserStatusEnum.ACTIVE,
      year,
    }),
  );

  const { state: stateSuspended } = await ssrPrefetch(
    trpc.user.getCountUserByStatus.queryOptions({
      status: UserStatusEnum.SUSPENDED,
      year,
    }),
  );

  const { state: statePosition } = await ssrPrefetch(
    trpc.user.getAllUserCountsByPosition.queryOptions(),
  );
  const { state: stateAudit } = await ssrPrefetch(
    trpc.auditlog.getAll.queryOptions({
      page: 1,
      pageSize: 5,
    }),
  );

  const mergedState = mergeDehydratedStates([
    stateActive,
    stateSuspended,
    statePosition,
    stateAudit,
  ]);

  return (
    <HydrateClient state={mergedState}>
      <div className="flex h-full w-full">
        <DashboardClientPage role={user?.roleName} />
      </div>
    </HydrateClient>
  );
}
