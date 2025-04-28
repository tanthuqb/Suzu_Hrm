"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export function usePermission(action: string) {
  const trpc = useTRPC();
  const { data: permissions } = useSuspenseQuery(
    trpc.acl.getPermissions.queryOptions(),
  );

  const hasPermission = permissions?.includes(action);
  return hasPermission;
}
