import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

export const metadata: Metadata = {
  title: "Work From Home Request",
  description: "Submit a request to work from home",
};

export default function eFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
