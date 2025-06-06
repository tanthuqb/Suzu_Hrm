import React from "react";
import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import { mergeDehydratedStates } from "~/libs";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import DepartmentsPage from "./_components/department";

const Page = async () => {
  const { status, message } = await checkRole(["admin", "hr"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  const { state: stateUser } = await ssrPrefetch(
    trpc.user.getAllUserSimple.queryOptions(),
  );

  const { state: stateDepartment } = await ssrPrefetch(
    trpc.department.getAll.queryOptions(),
  );

  const mergedState = mergeDehydratedStates([stateUser, stateDepartment]);

  return (
    <HydrateClient state={mergedState}>
      <DepartmentsPage />
    </HydrateClient>
  );
};

export default Page;
