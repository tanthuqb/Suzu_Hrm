import React from "react";
import dynamic from "next/dynamic";

import type { AuthUser } from "@acme/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import { checkAuth } from "~/app/actions/auth";

const WorkFromHomeForm = dynamic(
  () =>
    import("~/app/(app)/(dashboard)/eForms/_components/form-work-from-home"),
);

export default async function Page() {
  const user = (await checkAuth())!;

  if (!user) {
    return <div>You must be logged in to access this page.</div>;
  }

  return (
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
        <WorkFromHomeForm />
      </CardContent>
    </Card>
  );
}
