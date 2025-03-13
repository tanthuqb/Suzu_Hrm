"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import { useTRPC } from "~/trpc/react";

export function UserCard(props: {
  user: RouterOutputs["user"]["all"][number];
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteUser = useMutation({
    ...(trpc as any).user.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["user.all"] });
        toast.success("User deleted successfully");
      },
      onError: (err: any) => {
        toast.error(
          err.data?.code === "UNAUTHORIZED"
            ? "You must be logged in to delete a user"
            : "Failed to delete user",
        );
      },
    }),
  });

  return (
    <div className="flex flex-row rounded-lg bg-muted p-4">
      <div className="flex-grow">
        <h2 className="text-2xl font-bold text-primary">{props.user.name}</h2>
        <p className="mt-2 text-sm">{props.user.email}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Role: {props.user.role}
        </p>
      </div>
      <div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => deleteUser.mutate({ id: props.user.id! as string })}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export function UserCardSkeleton(props: { pulse?: boolean }) {
  const { pulse = true } = props;
  return (
    <div className="flex flex-row rounded-lg bg-muted p-4">
      <div className="flex-grow">
        <h2
          className={`w-1/4 rounded bg-primary text-2xl font-bold ${
            pulse && "animate-pulse"
          }`}
        >
          &nbsp;
        </h2>
        <p
          className={`mt-2 w-1/3 rounded bg-current text-sm ${
            pulse && "animate-pulse"
          }`}
        >
          &nbsp;
        </p>
      </div>
    </div>
  );
}
