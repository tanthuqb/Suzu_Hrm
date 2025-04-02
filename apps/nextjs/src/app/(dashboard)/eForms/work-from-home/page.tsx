import React from "react";
import dynamic from "next/dynamic";

import type { AuthUser } from "@acme/db";

import { checkAuth } from "~/app/actions/auth";

const WorkFromHomeForm = dynamic(
  () => import("~/app/(dashboard)/eForms/_components/form-work-from-home"),
);

export default async function Page() {
  const user = (await checkAuth()) as AuthUser;

  if (!user) {
    return <div>You must be logged in to access this page.</div>;
  }

  return <WorkFromHomeForm />;
}
