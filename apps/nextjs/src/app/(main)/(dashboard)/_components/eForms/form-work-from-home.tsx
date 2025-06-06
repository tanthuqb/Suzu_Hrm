"use client";

import { useQuery } from "@tanstack/react-query";

import type { AuthUser } from "@acme/db";

import { useTRPC } from "~/trpc/react";
import WFHForm from "./wfh-form";

export default function WorkFromHomeForm({ user }: { user: AuthUser }) {
  const trpc = useTRPC();

  const { data: departments } = useQuery({
    ...trpc.department.getAll.queryOptions(),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return <WFHForm user={user} departments={departments!} />;
}
