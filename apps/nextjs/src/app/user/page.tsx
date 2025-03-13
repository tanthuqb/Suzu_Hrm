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

export default function userPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: user } = useSuspenseQuery(
    trpc.user.all.queryOptions() ?? {
      queryKey: ["user.all"],
      queryFn: () => [] as RouterOutputs["user"]["all"],
    },
  );

  const deleteUser = useMutation({
    ...trpc.user.delete.mutationOptions({
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
    }),
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-center text-3xl font-bold">User Management</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <tr>
              <th className="w-[100px] px-4 py-3 text-center">ID</th>
              <th className="px-4 py-3 text-center">Name</th>
              <th className="px-4 py-3 text-center">Email</th>
              <th className="px-4 py-3 text-center">Role</th>
              <th className="w-[100px] px-4 py-3 text-center">Actions</th>
            </tr>
          </TableHeader>
          <TableBody>
            {user?.map((user: any) => (
              <tr key={user.id}>
                <td className="px-4 py-3 text-center">{user.id}</td>
                <td className="px-4 py-3 text-center">{user.name}</td>
                <td className="px-4 py-3 text-center">{user.email}</td>
                <td className="px-4 py-3 text-center">{user.role}</td>
                <td className="px-4 py-3 text-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteUser.mutate({ id: user.id })}
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
                Total user: {user?.length ?? 0}
              </td>
            </tr>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
