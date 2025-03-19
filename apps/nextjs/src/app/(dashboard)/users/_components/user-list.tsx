"use client";

import "react-loading-skeleton/dist/skeleton.css";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";
import { UserCard } from "./user-card";

export function UserList() {
  const trpc = useTRPC();

  const { data: users } = useSuspenseQuery(
    trpc.post?.all.queryOptions() ?? {
      queryKey: ["user.all"],
      queryFn: () => [] as RouterOutputs["user"]["all"],
    },
  );

  if (!users?.length) {
    return (
      <div className="mt-10 text-center text-gray-600">No users found.</div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {users.map((user) => (
        <UserCard
          key={user.id}
          id={user.id}
          name={user.name ?? `User ${user.id.slice(0, 4)}`}
          email={user.email ?? "No Email"}
          role={user.role ?? "User"}
        />
      ))}
    </div>
  );
}
