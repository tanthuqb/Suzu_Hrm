"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

import type { RouterInputs, RouterOutputs } from "@acme/api";
import type { SalarySlipWithUser } from "@acme/db";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";

import { useUserStatusModal } from "~/app/context/UserStatusModalContext";
import { useTRPC } from "~/trpc/react";

type UserListOutput = RouterOutputs["user"]["all"];
export function UserTable() {
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
  ) as {
    data: UserListOutput;
    refetch: () => void;
    isFetching: boolean;
  };

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
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage your user accounts and permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search users or email..."
              className="w-[200px] pr-10 md:w-[300px]"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`rounded-md border transition-opacity ${isFetching ? "opacity-50" : "opacity-100"}`}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">#</TableHead>
              <TableHead
                onClick={(e) => {
                  e.preventDefault();
                  toggleSort("firstName");
                }}
              >
                <div className="flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" />
                  FirstName
                </div>
              </TableHead>
              <TableHead onClick={() => toggleSort("email")}>
                <div className="flex items-center gap-1">
                  Email
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead onClick={() => toggleSort("role")}>Role</TableHead>
              <TableHead onClick={() => toggleSort("status")}>Status</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users?.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell className="font-medium">{user.firstName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Link
                    href={
                      user.latestSalarySlip?.id
                        ? `/salary-slip/${user.latestSalarySlip.id}`
                        : `/salary-slip/create?userId=${user.id}`
                    }
                    className={cn(
                      "text-sm font-medium underline underline-offset-2 transition-all duration-200",
                      user.latestSalarySlip?.id
                        ? "text-blue-600 hover:text-blue-800 hover:underline-offset-4"
                        : "text-green-600 hover:text-green-800 hover:underline-offset-4",
                    )}
                  >
                    {user.latestSalarySlip?.id
                      ? "View salary"
                      : "Create salary"}
                  </Link>
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openModal(user)}
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Page {page} / 20</div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(20, page + 1))}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value: string) =>
              setPageSize(Number.parseInt(value))
            }
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
