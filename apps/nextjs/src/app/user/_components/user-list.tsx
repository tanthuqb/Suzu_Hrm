"use client";

import type { TRPCError } from "@trpc/server";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import type { RouterOutputs } from "@acme/api";
import { toast } from "@acme/ui/toast";

import { useTRPC } from "~/trpc/react";
import { UserCardSkeleton } from "./user-card";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserCardProps {
  user: User;
}

function UserCard({ user }: UserCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <p className="font-medium">{user.name}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
      <div>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
          {user.role}
        </span>
      </div>
    </div>
  );
}

export function UserList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: users } = useSuspenseQuery(
    (trpc as any).user.all.queryOptions() ?? {
      queryKey: ["user.all"],
      queryFn: () => [],
    },
  );

  const deleteUser = useMutation({
    mutationFn: (userId: string) => (trpc as any).user.delete.mutate(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("User deleted successfully");
    },
    onError: (err: TRPCError) => {
      toast.error(
        err.message === "UNAUTHORIZED"
          ? "You must be an admin to delete user"
          : "Failed to delete user",
      );
    },
  });

  if (!users || users.length === 0) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <UserCardSkeleton pulse={false} />
        <UserCardSkeleton pulse={false} />
        <UserCardSkeleton pulse={false} />

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <p className="text-2xl font-bold text-white">No users found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {users.map((user: any) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
