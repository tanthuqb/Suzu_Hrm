"use client";

import "react-loading-skeleton/dist/skeleton.css";

import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";

import type { RouterInputs, RouterOutputs } from "@acme/api";
import type { IUser } from "@acme/db";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";

import { UserStatusModal } from "~/app/_components/UserStatusModal";
import { useUserStatusModal } from "~/app/context/UserStatusModalContext";
import { useTRPC } from "~/trpc/react";
import { TableSkeleton } from "./table-skeleton";

type UserListOutput = RouterOutputs["user"]["all"];

export function UserList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] =
    useState<RouterInputs["user"]["all"]["sortBy"]>("email");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const debouncedSearch = useDebounce(search, 300);
  const trpc = useTRPC();

  const { openModal } = useUserStatusModal();

  const input: RouterInputs["user"]["all"] = {
    page,
    pageSize,
    search: debouncedSearch,
    sortBy,
    order,
  };

  const { data, refetch, isFetching } = useSuspenseQuery(
    trpc.user?.all.queryOptions(input),
  ) as { data: UserListOutput; refetch: () => void; isFetching: boolean };

  useEffect(() => {
    void refetch();
  }, [page, pageSize, debouncedSearch, sortBy, order, refetch]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("asc");
    }
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <select
          className="rounded-md border p-2 text-sm"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              Show {n}
            </option>
          ))}
        </select>
      </div>

      {isFetching ? (
        <TableSkeleton />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead
                onClick={() => toggleSort("firstName")}
                className="cursor-pointer"
              >
                Name {sortBy === "firstName" && (order === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                onClick={() => toggleSort("email")}
                className="cursor-pointer"
              >
                Email {sortBy === "email" && (order === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                onClick={() => toggleSort("role")}
                className="cursor-pointer"
              >
                Role {sortBy === "role" && (order === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            ) : (
              data.users.map((user: IUser, i: number) => (
                <TableRow key={user.id}>
                  <TableCell>{(page - 1) * pageSize + i + 1}</TableCell>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    <Button
                      variant={"destructive"}
                      onClick={() => openModal(user)}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
      <UserStatusModal />

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          Prev
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} / {Math.ceil(data.total / pageSize) || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setPage((p) => (p < Math.ceil(data.total / pageSize) ? p + 1 : p))
          }
          disabled={page >= Math.ceil(data.total / pageSize)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
