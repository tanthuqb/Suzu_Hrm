import React from "react";
import { redirect } from "next/navigation";

import { checkAuth } from "~/app/actions/auth";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import DepartmentsPage from "./_components/department";

const Page = async () => {
  const AuthUser = await checkAuth();
  if (!AuthUser) {
    redirect("/login?message=You must be logged in to access this page.");
  }

  if (AuthUser.role !== "admin") {
    redirect("/login?message=You do not have permission to access this page.");
  }

  const { state } = await ssrPrefetch(trpc.department.getAll.queryOptions());

  return (
    <HydrateClient state={state}>
      <DepartmentsPage />
    </HydrateClient>
  );
};

export default Page;
