"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Filter, Search, X } from "lucide-react";

import type { LeaveBalanceRecord } from "@acme/db/schema";
import { AttendanceStatus } from "@acme/db";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Skeleton } from "@acme/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";

import type {
  AttendanceRecord,
  GetAllAttendancesResponse,
} from "~/libs/data/attendances";
import { formatDate } from "~/libs";

const getStatusBadge = (status: string) => {
  const statusConfig = {
    approved: { label: "Đã duyệt", variant: "default" as const },
    pending: { label: "Chờ duyệt", variant: "secondary" as const },
    rejected: { label: "Từ chối", variant: "destructive" as const },
    [AttendanceStatus.WorkDay]: {
      label: "Ngày công có lương",
      variant: "default" as const,
    },
    [AttendanceStatus.PaidLeaveFull]: {
      label: "Nghỉ phép cả ngày có lương",
      variant: "secondary" as const,
    },
    [AttendanceStatus.PaidLeaveHalfWork]: {
      label: "Nghỉ phép nửa ngày có lương",
      variant: "secondary" as const,
    },
    [AttendanceStatus.UnpaidLeave]: {
      label: "Nghỉ không lương",
      variant: "destructive" as const,
    },
    [AttendanceStatus.PaidHoliday]: {
      label: "Nghỉ lễ có lương",
      variant: "default" as const,
    },
    [AttendanceStatus.CompensateFull]: {
      label: "Nghỉ bù cả ngày có lương",
      variant: "default" as const,
    },
    [AttendanceStatus.WorkFromHome]: {
      label: "Làm việc tại nhà",
      variant: "outline" as const,
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    variant: "outline" as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

function AttendanceDetailsDialog({
  attendance,
  leavebalance,
}: {
  attendance: AttendanceRecord;
  leavebalance: LeaveBalanceRecord;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
          <span className="sr-only">Xem chi tiết</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết thông tin chấm công</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết của{" "}
            {attendance.userLastName + " " + attendance.userFirtName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Status and Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                Tổng quan
                {getStatusBadge(attendance.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm font-medium">Tổng số ngày nghỉ</p>
                  <p className="text-sm text-muted-foreground">
                    {leavebalance.totalDays || "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Ngày nghỉ đã nghỉ</p>
                  <p className="text-sm text-muted-foreground">
                    {leavebalance.usedDays || "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Số ngày nghỉ còn lại</p>
                  <p className="text-sm text-muted-foreground">
                    {leavebalance.remainingDays || "Chưa cập nhật"} ngày
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Thông tin cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Họ và tên</p>
                  <p className="text-sm text-muted-foreground">
                    {attendance.userLastName + " " + attendance.userFirtName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {attendance.userEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Số điện thoại</p>
                  <p className="text-sm text-muted-foreground">
                    {attendance.phone || "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Chức vụ</p>
                  <p className="text-sm text-muted-foreground">
                    {attendance.postion || "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phòng ban</p>
                  <p className="text-sm text-muted-foreground">
                    {attendance.departmentName}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Approval Information */}
            {attendance.approvedByName &&
              attendance.date &&
              attendance.status && (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Thông tin duyệt
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Người duyệt</p>
                        <p className="text-sm text-muted-foreground">
                          {attendance.approvedByName || "Chưa có"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Ngày duyệt</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(attendance.date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Trạng thái</p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(
                            attendance.approvedByName || "pending",
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
          </div>

          {/* Time Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Thông tin thời gian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium">Ngày bắt đầu</p>
                  <p className="text-sm text-muted-foreground">
                    {attendance.startDate
                      ? formatDate(attendance.startDate)
                      : "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Ngày kết thúc</p>
                  <p className="text-sm text-muted-foreground">
                    {attendance.startDate
                      ? formatDate(attendance.endDate!)
                      : "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Ngày tạo đơn</p>
                  <p className="text-sm text-muted-foreground">
                    {attendance.startDate
                      ? formatDate(attendance.createdAt!)
                      : "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function AttendancesTable({
  initialData,
  leavebalance,
}: {
  initialData?: GetAllAttendancesResponse;
  leavebalance?: LeaveBalanceRecord;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [approver, setApprover] = useState("");
  const [status, setStatus] = useState("");
  const pageSize = 10;

  const isInitial =
    page === 1 && !search && !dateFrom && !dateTo && !approver && !status;

  const { data, isLoading } = useQuery<GetAllAttendancesResponse>({
    queryKey: [
      "attendances",
      page,
      pageSize,
      search,
      dateFrom,
      dateTo,
      approver,
      status,
    ],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(approver && { approver }),
        ...(status && { status }),
      });
      const res = await fetch(`/api/attendances?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch attendances");
      return res.json();
    },
    initialData: isInitial ? initialData : undefined,
  });

  const totalPages = Math.ceil((data?.pagination.totalCount ?? 0) / pageSize);

  const uniqueApprovers = Array.from(
    new Set(data?.attendances.map((a) => a.approvedByName).filter(Boolean)),
  );

  const clearAllFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setApprover("");
    setStatus("");
    setPage(1);
  };

  const hasActiveFilters = search || dateFrom || dateTo || approver || status;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="pl-9"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Bộ lọc
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {
                      [search, dateFrom, dateTo, approver, status].filter(
                        Boolean,
                      ).length
                    }
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Bộ lọc nâng cao</h4>
                  <p className="text-sm text-muted-foreground">
                    Lọc dữ liệu theo các tiêu chí
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Khoảng thời gian
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          type="date"
                          placeholder="Từ ngày"
                          value={dateFrom}
                          onChange={(e) => {
                            setDateFrom(e.target.value);
                            setPage(1);
                          }}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          type="date"
                          placeholder="Đến ngày"
                          value={dateTo}
                          onChange={(e) => {
                            setDateTo(e.target.value);
                            setPage(1);
                          }}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Approver Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Người duyệt</label>
                    <Select
                      value={approver}
                      onValueChange={(value) => {
                        setApprover(value);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn người duyệt" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {uniqueApprovers.map((approverName) => (
                          <SelectItem key={approverName} value={approverName!}>
                            {approverName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trạng thái</label>
                    <Select
                      value={status}
                      onValueChange={(value) => {
                        setStatus(value);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="approved">Đã duyệt</SelectItem>
                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                        <SelectItem value="rejected">Từ chối</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Xóa tất cả bộ lọc
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-9 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {search && (
              <Badge variant="secondary" className="gap-1">
                Tìm kiếm: {search}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                />
              </Badge>
            )}
            {dateFrom && (
              <Badge variant="secondary" className="gap-1">
                Từ: {new Date(dateFrom).toLocaleDateString("vi-VN")}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setDateFrom("");
                    setPage(1);
                  }}
                />
              </Badge>
            )}
            {dateTo && (
              <Badge variant="secondary" className="gap-1">
                Đến: {new Date(dateTo).toLocaleDateString("vi-VN")}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setDateTo("");
                    setPage(1);
                  }}
                />
              </Badge>
            )}
            {approver && (
              <Badge variant="secondary" className="gap-1">
                Duyệt bởi: {approver}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setApprover("");
                    setPage(1);
                  }}
                />
              </Badge>
            )}
            {status && (
              <Badge variant="secondary" className="gap-1">
                Trạng thái:{" "}
                {status === "approved"
                  ? "Đã duyệt"
                  : status === "pending"
                    ? "Chờ duyệt"
                    : "Từ chối"}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setStatus("");
                    setPage(1);
                  }}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results info */}
      <div className="text-sm text-muted-foreground">
        Hiển thị {data?.attendances.length ?? 0} trong tổng số{" "}
        {data?.pagination.totalCount ?? 0} bản ghi
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Họ tên</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Chức Vụ</TableHead>
              <TableHead className="font-semibold">Phòng Ban</TableHead>
              <TableHead className="font-semibold">Ngày công</TableHead>
              <TableHead className="font-semibold">Lý do</TableHead>
              <TableHead className="font-semibold">Duyệt bởi</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="w-[70px] font-semibold">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : data?.attendances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-muted-foreground">
                      {hasActiveFilters
                        ? "Không tìm thấy kết quả phù hợp"
                        : "Không có dữ liệu"}
                    </div>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                      >
                        Xóa tất cả bộ lọc
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.attendances.map((attendance: AttendanceRecord) => (
                <TableRow key={attendance.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {attendance.userLastName + " " + attendance.userFirtName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {attendance.userEmail}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {attendance.postion ?? "Chưa cập nhật"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {attendance.departmentName}
                  </TableCell>
                  <TableCell>{formatDate(attendance.date)}</TableCell>
                  <TableCell>
                    <div
                      className="max-w-xs truncate"
                      title={attendance.leaveRequestReason!}
                    >
                      {attendance.leaveRequestReason ?? "null"}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {attendance.approvedByName ?? "null"}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(attendance.status || "pending")}
                  </TableCell>
                  <TableCell>
                    <AttendanceDetailsDialog
                      attendance={attendance}
                      leavebalance={leavebalance!}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Trang {page} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
