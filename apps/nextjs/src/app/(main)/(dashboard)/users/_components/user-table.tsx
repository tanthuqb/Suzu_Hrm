"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

import type { UserListItem } from "@acme/db";
import type { SalarySlipRecord } from "@acme/db/schema";
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

import { useUserStatusModal } from "~/context/UserStatusModalContext";
import { useTRPC } from "~/trpc/react";
import { SetDepartmentDialog } from "./set-department-client";
import { SetLeaveBalanceDialog } from "./set-leavebalance-client";
import { SetPositionDialog } from "./set-position-client";
import { SetRoleDialog } from "./set-role-client";

type SortField = "email" | "firstName" | "status" | "role" | undefined;

export function UserTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [sortBy, setSortBy] = useState<SortField>("email");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const { openModal } = useUserStatusModal();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState<string | undefined>(
    undefined,
  );

  const [selectedUserDepartment, setSelectedUserDepartment] = useState<
    string | undefined
  >(undefined);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [selectedUserPosition, setSelectedUserPosition] = useState<
    string | undefined
  >(undefined);
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);
  const [isLeaveBalanceDialogOpen, setIsLeaveBalanceDialogOpen] =
    useState(false);
  const [selectedUserLeaveBalance, setSelectedUserLeaveBalance] = useState<
    string | undefined
  >(undefined);

  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const trpc = useTRPC();

  const input = useMemo(
    () => ({
      page,
      pageSize,
      search: debouncedSearch,
      sortBy,
      order,
    }),
    [page, pageSize, debouncedSearch, sortBy, order],
  );

  const { data, isFetching } = useQuery({
    ...trpc.user.all.queryOptions(input),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!page && !!pageSize,
  });

  const { data: roles } = useQuery({
    ...trpc.role.getAll.queryOptions(),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: true,
  });
  const { data: departments } = useQuery({
    ...trpc.department.getAll.queryOptions(),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: true,
  });
  const { data: positions } = useQuery({
    ...trpc.position.getAll.queryOptions(),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: true,
  });
  const userIds = data?.users.map((u) => u.id) ?? [];

  const { data: latestSalaryByUserIds } = useQuery({
    ...trpc.salary.getLatestSalaryByUserIds.queryOptions(),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: userIds.length > 0,
  });

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("asc");
    }
    setPage(1);
  };

  const setRole = (userId: string, roleName?: string) => {
    setSelectedUserId(userId);
    setSelectedUserRole(userId);
    setSelectedUserRole(roleName);
    setIsRoleDialogOpen(true);
  };

  const setDepartment = (userId: string, departmentName?: string) => {
    setSelectedUserId(userId);
    setSelectedUserDepartment(userId);
    setSelectedUserDepartment(departmentName);
    setIsDepartmentDialogOpen(true);
  };

  const setPosition = (userId: string, positionName?: string) => {
    setSelectedUserId(userId);
    setSelectedUserPosition(userId);
    setSelectedUserPosition(positionName);
    setIsPositionDialogOpen(true);
  };

  const setLeaveBalance = (userId: string, leaveBalance?: string) => {
    setSelectedUserId(userId);
    setSelectedUserLeaveBalance(leaveBalance);
    setIsLeaveBalanceDialogOpen(true);
  };

  const usersWithLatestSalarySlip = data?.users.map((user) => {
    const latestSlip = latestSalaryByUserIds?.find(
      (slip) => slip.userId === user.id,
    );
    return {
      ...user,
      latestSalarySlip: latestSlip,
    };
  });

  return (
    <div className="flex h-full w-full flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 lg:px-6">
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
      </header>

      <main className="flex h-full flex-1 flex-col overflow-hidden p-4">
        <div className="flex flex-1 flex-col rounded-md border bg-white">
          <div
            className={`min-h-0 flex-1 rounded-md border transition-opacity ${isFetching ? "opacity-50" : "opacity-100"}`}
          >
            <div className="max-h-[calc(100vh-240px)] overflow-y-auto border-t">
              <Table className="w-full table-auto border-collapse">
                <TableHeader>
                  <TableRow className="sticky top-0 bg-white">
                    <TableHead>Full Name</TableHead>
                    <TableHead onClick={() => toggleSort("email")}>
                      <div className="flex items-center gap-1">
                        Email
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Phòng Ban</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead onClick={() => toggleSort("role")}>
                      Role
                    </TableHead>
                    <TableHead onClick={() => toggleSort("status")}>
                      Status
                    </TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="h-full">
                  {usersWithLatestSalarySlip?.map(
                    (
                      user: UserListItem & {
                        latestSalarySlip?: SalarySlipRecord;
                      },
                    ) => {
                      return (
                        <TableRow
                          key={user.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <TableCell className="font-medium">
                            {user.firstName + " " + user.lastName}
                          </TableCell>
                          <TableCell>
                            {user.email ? user.email : null}
                          </TableCell>
                          <TableCell>
                            {user.department?.name
                              ? user.department.name
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {user.position?.name ? user.position.name : "N/A"}
                          </TableCell>
                          <TableCell>{user.role?.name}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.status == "active"
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
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openModal(user)}
                              >
                                Update
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setRole(user.id);
                                }}
                              >
                                Role
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="hidden sm:inline-flex"
                                onClick={() => {
                                  setDepartment(user.id);
                                }}
                              >
                                Department
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="hidden sm:inline-flex"
                                onClick={() => {
                                  setPosition(user.id);
                                }}
                              >
                                Position
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="hidden sm:inline-flex"
                                onClick={() => {
                                  setLeaveBalance(user.id);
                                }}
                              >
                                Ngày Nghỉ
                              </Button>
                            </div>
                            <SetRoleDialog
                              isOpen={isRoleDialogOpen}
                              onClose={() => setIsRoleDialogOpen(false)}
                              roles={roles}
                              userId={selectedUserId}
                              currentRoleName={selectedUserRole}
                            />
                            <SetDepartmentDialog
                              isOpen={isDepartmentDialogOpen}
                              onClose={() => setIsDepartmentDialogOpen(false)}
                              departments={departments}
                              userId={selectedUserId}
                              currentDepartmentName={selectedUserDepartment}
                            />
                            <SetPositionDialog
                              isOpen={isPositionDialogOpen}
                              onClose={() => setIsPositionDialogOpen(false)}
                              positions={positions}
                              userId={selectedUserId}
                              currentPositionName={selectedUserPosition}
                            />
                            <SetLeaveBalanceDialog
                              isOpen={isLeaveBalanceDialogOpen}
                              onClose={() => setIsLeaveBalanceDialogOpen(false)}
                              userId={selectedUserId}
                              // currentLeaveBalance={selectedUserLeaveBalance}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between sm:flex-row">
          <div className="mb-2 text-sm text-muted-foreground sm:mb-0">
            Page {page} / 20
          </div>
          <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
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
      </main>
    </div>
  );
}
