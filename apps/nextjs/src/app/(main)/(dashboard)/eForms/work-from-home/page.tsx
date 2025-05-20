import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import { checkAuth } from "~/actions/auth";
import WorkFromHomeForm from "~/app/(main)/(dashboard)/eForms/_components/form-work-from-home";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";

export default async function Page() {
  const Auth = await checkAuth();

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
          <WorkFromHomeForm user={Auth.user!} />
        </CardContent>
      </Card>
    </HydrateClient>
  );
}
