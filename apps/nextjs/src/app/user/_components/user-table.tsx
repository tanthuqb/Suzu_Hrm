"use client";

import type { TRPCError } from "@trpc/server";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import { Table, TableBody, TableFooter, TableHeader } from "@acme/ui/table";

import { useTRPC } from "~/trpc/react";

type User = RouterOutputs["user"]["all"][number];

export function UserTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: users = [] } = useSuspenseQuery<User[]>(
    trpc.user.all.queryOptions() ?? {
      queryKey: ["user.all"],
      queryFn: () => [],
    },
  );

  const deleteUser = useMutation({
    ...trpc.user.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["user.all"] });
        toast.success("User deleted successfully");
      },
      onError: (err: TRPCError) => {
        toast.error(
          err.message === "UNAUTHORIZED"
            ? "You must be an admin to delete users"
            : "Failed to delete user",
        );
      },
    }),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <tr>
            <th className="w-[100px] px-4 py-3">ID</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="w-[100px] px-4 py-3">Actions</th>
          </tr>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3">{user.id}</td>
              <td className="px-4 py-3">{user.name}</td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{user.role}</td>
              <td className="px-4 py-3">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (user.id) {
                      deleteUser.mutate({ id: user.id });
                    }
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </TableBody>
        <TableFooter>
          <tr>
            <td colSpan={5} className="px-4 py-3 text-right">
              Total Users: {users.length}
            </td>
          </tr>
        </TableFooter>
      </Table>
    </div>
  );
}
