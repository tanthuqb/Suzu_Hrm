import React, { Suspense } from "react";
import { redirect } from "next/navigation";

import { UserTableSkeleton } from "~/app/(app)/_components/table-skeleton";
import { checkAuth } from "~/app/actions/auth";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import RoleManager from "./../_components/role-table";

export default async function PageRolesManagers() {
  const auth = await checkAuth();
  if (!auth.status || !auth.user) {
    redirect(
      `/login?message=${encodeURIComponent(auth.message || "Bạn cần đăng nhập.")}`,
    );
  }
  const { state } = await ssrPrefetch(trpc.role.getAll.queryOptions());

  return (
    <HydrateClient state={state}>
      <Suspense fallback={<UserTableSkeleton />}>
        <RoleManager />
      </Suspense>
    </HydrateClient>
  );
}
