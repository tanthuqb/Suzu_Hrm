import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import WorkFormHome from "./work-from-home/page";

export const metadata: Metadata = {
  title: "Work From Home Request",
  description: "Submit a request to work from home",
};

export default async function eFormLayout() {
  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center">
        <Card className="w-full shadow-lg">
          <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-indigo-50 pb-6 text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              Work From Home Request
            </CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              Please fill out the form below to submit your work from home
              request
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <WorkFormHome />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
