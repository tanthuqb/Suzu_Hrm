"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, Filter } from "lucide-react";

import { cn } from "@acme/ui";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Calendar } from "@acme/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
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
import { toast } from "@acme/ui/toast";
import { emailSchema } from "@acme/validators";

import type { AuditLogPagination } from "~/libs/data/auditlog";
import { formatDate } from "~/libs";

interface FilterState {
  userId?: string;
  action?: string;
  entity?: string;
  request?: string;
  response?: string;
  startDate?: Date;
  payload?: string;
  endDate?: Date;
  page: number;
  pageSize: number;
  email?: string;
}

export default function AuditLogsTable({
  initialData,
}: {
  initialData?: AuditLogPagination;
}) {
  const [filters, setFilters] = useState<FilterState>({
    page: 1,
    pageSize: 20,
  });

  const isDefaultFilter =
    filters.page === 1 &&
    filters.pageSize === 20 &&
    !filters.email &&
    !filters.action &&
    !filters.entity &&
    !filters.request &&
    !filters.response &&
    !filters.payload &&
    !filters.userId &&
    !filters.startDate &&
    !filters.endDate;

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: filters.page.toString(),
        pageSize: filters.pageSize.toString(),
        email: filters.email ?? "",
        action: filters.action ?? "",
        entity: filters.entity ?? "",
        request: filters.request ?? "",
        response: filters.response ?? "",
        payload: filters.payload ?? "",
        userId: filters.userId ?? "",
        startDate: filters.startDate ? filters.startDate.toISOString() : "",
        endDate: filters.endDate ? filters.endDate.toISOString() : "",
      }).toString();
      const res = await fetch(`/api/audit-logs?${query}`);
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return (await res.json()) as AuditLogPagination;
    },
    initialData: isDefaultFilter ? initialData : undefined,
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const applyFilters = () => {
    if (filters.email && filters.email.trim() !== "") {
      const result = emailSchema.safeParse(filters.email);
      if (!result.success) {
        toast("Email không hợp lệ hoặc không đúng định dạng");
        return;
      }
    }
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      pageSize: 20,
    });
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "default";
      case "update":
        return "secondary";
      case "delete":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Theo dõi và quản lý các hoạt động trong hệ thống
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Bộ lọc
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="border-t">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="Email">Email</Label>
                <Input
                  id="email"
                  placeholder="Nhập Email..."
                  value={filters.email ?? ""}
                  onChange={(e) => handleFilterChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select
                  value={filters.action ?? ""}
                  onValueChange={(value) => handleFilterChange("action", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entity">Entity</Label>
                <Input
                  id="entity"
                  placeholder="Nhập entity..."
                  value={filters.entity ?? ""}
                  onChange={(e) => handleFilterChange("entity", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request">Request</Label>
                <Input
                  id="request"
                  placeholder="Nhập request..."
                  value={filters.request ?? ""}
                  onChange={(e) =>
                    handleFilterChange("request", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Từ ngày</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.startDate ? (
                        formatDate(filters.startDate.toISOString())
                      ) : (
                        <span>Chọn ngày bắt đầu</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => handleFilterChange("startDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Đến ngày</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.endDate ? (
                        formatDate(filters.endDate.toISOString())
                      ) : (
                        <span>Chọn ngày kết thúc</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => handleFilterChange("endDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Số bản ghi/trang</Label>
                <Select
                  value={filters.pageSize.toString()}
                  onValueChange={(value) =>
                    handleFilterChange("pageSize", Number.parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  variant="default"
                  onClick={applyFilters}
                  className="w-full"
                >
                  Tìm kiếm
                </Button>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-t-md border border-b-0">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>User Email</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : data?.logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {log.users?.email!}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.entity}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {log.request}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {log.response}
                      </TableCell>
                      <TableCell>
                        {log.created_at && formatDate(log.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between rounded-b-md border-x border-b bg-white px-4 py-2">
            <div className="text-sm text-muted-foreground">
              Page {filters.page} / {data?.pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleFilterChange("page", filters.page - 1)}
                disabled={filters.page <= 1}
              >
                <span className="sr-only">Trang trước</span>
                <svg width="20" height="20" fill="none">
                  <path
                    d="M13 16l-4-4 4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
              <span className="text-sm">{filters.page}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleFilterChange("page", filters.page + 1)}
                disabled={filters.page >= (data?.pagination.totalPages ?? 1)}
              >
                <span className="sr-only">Trang sau</span>
                <svg width="20" height="20" fill="none">
                  <path
                    d="M7 8l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
              <span className="ml-4">Show</span>
              <select
                className="rounded border px-2 py-1 text-sm"
                value={filters.pageSize}
                onChange={(e) =>
                  handleFilterChange("pageSize", Number(e.target.value))
                }
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
