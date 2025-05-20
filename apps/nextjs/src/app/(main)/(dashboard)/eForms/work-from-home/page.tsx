import React from "react";
import dynamic from "next/dynamic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import { checkAuth } from "~/actions/auth";

const WorkFromHomeForm = dynamic(
  () =>
    import("~/app/(main)/(dashboard)/eForms/_components/form-work-from-home"),
);

export default async function Page() {
  const Auth = await checkAuth();

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
        <WorkFromHomeForm user={Auth.user!} />
      </CardContent>
    </Card>
  );
}
