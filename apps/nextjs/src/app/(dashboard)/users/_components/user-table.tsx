"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@acme/ui/table";

import { trpc } from "~/trpc/react";
import { TableSkeleton } from "./table-skeleton";

export function UserTable() {
  const { data: users, isLoading } = trpc.user.all.useQuery();
  const router = useRouter();
  
  const handleViewDetails = useCallback((id: string) => {
    router.push(`/users/${id}`);
  }, [router]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (!users?.length) {
    return (
      <div className="mt-10 text-center text-gray-600">
        No users found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.id.slice(0, 8)}...</TableCell>
            <TableCell>{user.name ?? "N/A"}</TableCell>
            <TableCell>{user.email ?? "N/A"}</TableCell>
            <TableCell>{user.role ?? "User"}</TableCell>
            <TableCell>
              <Button size="sm" onClick={() => handleViewDetails(user.id)}>
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}