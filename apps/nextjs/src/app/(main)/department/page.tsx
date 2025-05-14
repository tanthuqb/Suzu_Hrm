import React from "react";
import { redirect } from "next/navigation";

import { checkAuth } from "~/actions/auth";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import DepartmentsPage from "./_components/department";

const Page = async () => {
  const AuthUser = await checkAuth();

  if (!AuthUser.user) {
    redirect("/login?message=You must be logged in to access this page.");
  }

  const isAdmin = AuthUser.user.role.name === "Admin";
  if (isAdmin) {
    redirect("/login?message=You do not have permission to access this page.");
  }

  const { state: stateUser } = await ssrPrefetch(
    trpc.user.getAllUserSimple.queryOptions(),
  );

  const { state: stateDepartment } = await ssrPrefetch(
    trpc.department.getAll.queryOptions(),
  );

  const mergedState = {
    ...stateUser,
    ...stateDepartment,
  };

  return (
    <HydrateClient state={mergedState}>
      <DepartmentsPage />
    </HydrateClient>
  );
};

export default Page;
