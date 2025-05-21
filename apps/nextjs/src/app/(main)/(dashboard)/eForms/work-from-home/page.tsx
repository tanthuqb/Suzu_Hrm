import React from "react";
import { redirect } from "next/navigation";

import { VALID_ROLES } from "@acme/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import { checkRole } from "~/actions/auth";
import WorkFromHomeForm from "~/app/(main)/(dashboard)/_components/eForms/form-work-from-home";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";

export default async function Page() {
  const { status, user, message } = await checkRole(VALID_ROLES);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  const { state } = await ssrPrefetch(trpc.department.getAll.queryOptions());

  return (
    <HydrateClient state={state}>
      <Card className="w-full shadow-lg">
        <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-indigo-50 pb-6 text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Work From Home Request
          </CardTitle>
          <CardDescription className="mt-2 text-muted-foreground">
            Please fill out the form below to submit your work from home request
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <WorkFromHomeForm user={user!} />
        </CardContent>
      </Card>
    </HydrateClient>
  );
}
