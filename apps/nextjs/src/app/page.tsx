import { Suspense } from "react";
import { dehydrate } from "@tanstack/react-query";

import { UserStatusEnum } from "@acme/db";

import DashboardClientPage from "~/app/(main)/(dashboard)/_components/dashboards/page-client";
import { LoadingSpinner } from "~/components/commons/loading-spiner";
import { getQueryClient, HydrateClient, prefetch, trpc } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await prefetch(
    trpc.user.getCountUserByStatus.queryOptions({
      status: UserStatusEnum.ACTIVE,
      year: new Date().getFullYear(),
    }),
  );

  await prefetch(
    trpc.user.getCountUserByStatus.queryOptions({
      status: UserStatusEnum.SUSPENDED,
      year: new Date().getFullYear(),
    }),
  );

  await prefetch(trpc.user.getAllUserCountsByPosition.queryOptions());

  await prefetch(
    trpc.auditlog.getAll.queryOptions({
      page: 1,
      pageSize: 5,
    }),
  );

  const state = dehydrate(getQueryClient());

  return (
    <HydrateClient state={state}>
      <div className="flex h-full w-full">
        <Suspense fallback={<LoadingSpinner />}>
          <DashboardClientPage />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
