import React from "react";
import { redirect } from "next/navigation";

import { checkAuth } from "~/actions/auth";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import RoleManager from "../_components/role-table";

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
      <RoleManager />
    </HydrateClient>
  );
}
