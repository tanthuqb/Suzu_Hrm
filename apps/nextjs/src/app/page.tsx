import { dehydrate } from "@tanstack/react-query";

import { UserStatusEnum } from "@acme/db";

import DashboardClientPage from "~/app/(main)/(dashboard)/_components/dashboards/page-client";
import { getQueryClient, HydrateClient, prefetch, trpc } from "~/trpc/server";

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

  const state = dehydrate(getQueryClient());

  return (
    <HydrateClient state={state}>
      <div className="flex h-full w-full">
        <DashboardClientPage />
      </div>
    </HydrateClient>
  );
}
