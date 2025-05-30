"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Download, Filter } from "lucide-react";

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

import { trpc } from "~/trpc/server";

interface FilterState {
  userId?: string;
  action?: string;
  entity?: string;
  request?: string;
  response?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  pageSize: number;
}

export default function AuditLogsTable() {
  const [filters, setFilters] = useState<FilterState>({
    page: 1,
    pageSize: 20,
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = {
    data: {
      logs: [
        // Mock data for demonstration
        {
          id: "1",
          userId: "user123",
          action: "create",
          entity: "post",
          request: '{"title": "New Post"}',
          response: '{"id": "1", "title": "New Post"}',
          createdAt: new Date().toISOString(),
        },
      ],
      totalCount: 1,
      totalPages: 1,
    },
    isLoading: false,
  };

  // const { data, isLoading } = useSuspenseQuery({
  //   ...trpc.auditlog.getAll.queryOptions({
  //     page: filters.page,
  //     pageSize: filters.pageSize,
  //   }),
  //   staleTime: Number.POSITIVE_INFINITY,
  //   refetchOnMount: false,
  //   refetchOnWindowFocus: false,
  // });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value, // Reset to page 1 when filtering
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      pageSize: 20,
    });
  };

  const exportToCSV = () => {
    if (!data.logs) return;

    const headers = [
      "ID",
      "User ID",
      "Action",
      "Entity",
      "Request",
      "Response",
      "Created At",
    ];
    const csvContent = [
      headers.join(","),
      ...data.logs.map((log) =>
        [
          log.id,
          log.userId,
          log.action,
          log.entity,
          log.request,
          log.response,
          format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss"),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "dd-MM-yyyy")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
              {/* <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                Xuất CSV
              </Button> */}
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="border-t">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  placeholder="Nhập User ID..."
                  value={filters.userId || ""}
                  onChange={(e) => handleFilterChange("userId", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select
                  value={filters.action || ""}
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
                  value={filters.entity || ""}
                  onChange={(e) => handleFilterChange("entity", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request">Request</Label>
                <Input
                  id="request"
                  placeholder="Nhập request..."
                  value={filters.request || ""}
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
                        format(filters.startDate, "dd/MM/yyyy", { locale: vi })
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
                        format(filters.endDate, "dd/MM/yyyy", { locale: vi })
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

              <div className="flex items-end">
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

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User ID</TableHead>
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
                ) : data.logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  data.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.id}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.userId}
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
                        {log.createdAt &&
                          format(
                            new Date(log.createdAt),
                            "dd/MM/yyyy HH:mm:ss",
                            {
                              locale: vi,
                            },
                          )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(filters.page - 1) * filters.pageSize + 1} đến{" "}
                {Math.min(filters.page * filters.pageSize, data.totalCount)}{" "}
                trong tổng số {data.totalCount} bản ghi
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange("page", filters.page - 1)}
                  disabled={filters.page <= 1}
                >
                  Trước
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, data.totalPages) },
                    (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <Button
                          key={pageNumber}
                          variant={
                            filters.page === pageNumber ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handleFilterChange("page", pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      );
                    },
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange("page", filters.page + 1)}
                  disabled={filters.page >= data.totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
