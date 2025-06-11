"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search, X } from "lucide-react";

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

function AttendanceDetailsDialog({
  attendance,
}: {
  attendance: AttendanceRecord;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
          <span className="sr-only">Xem chi tiết</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết thông tin</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết của {attendance.userName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Thông tin cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Họ tên</p>
                  <p className="text-sm text-muted-foreground">
                    {attendance.userName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {attendance.userEmail}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Thông tin duyệt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Duyệt bởi</p>
                  <p className="text-sm text-muted-foreground">
                    {attendance.approvedByName}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lý do chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm leading-relaxed">
                  {attendance.leaveRequestReason}
                </p>
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
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function AttendancesTable({
  initialData,
}: {
  initialData?: GetAllAttendancesResponse;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const isInitial = page === 1 && !search;

  const { data, isLoading } = useQuery<GetAllAttendancesResponse>({
    queryKey: ["attendances", page, pageSize, search],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
      });
      const res = await fetch(`/api/attendances?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch attendances");
      return res.json();
    },
    initialData: isInitial ? initialData : undefined,
  });

  const totalPages = Math.ceil((data?.pagination.totalCount ?? 0) / pageSize);

  return (
    <div className="space-y-4">
      {/* Search */}
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
        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            className="h-9 px-2"
          >
            <X className="h-4 w-4" />
          </Button>
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
              <TableHead className="font-semibold">Chức Vụ</TableHead>
              <TableHead className="font-semibold">Phòng Ban</TableHead>
              <TableHead className="font-semibold">Lý do</TableHead>
              <TableHead className="font-semibold">Duyệt bởi</TableHead>
              <TableHead className="w-[70px] font-semibold">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : data?.attendances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-muted-foreground">
                      {search
                        ? "Không tìm thấy kết quả phù hợp"
                        : "Không có dữ liệu"}
                    </div>
                    {search && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearch("");
                          setPage(1);
                        }}
                      >
                        Xóa tìm kiếm
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.attendances.map((attendance: AttendanceRecord) => (
                <TableRow key={attendance.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {attendance.userName}
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
                  <TableCell>
                    <div
                      className="max-w-xs truncate"
                      title={attendance.leaveRequestReason!}
                    >
                      {attendance.leaveRequestReason}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {attendance.approvedByName}
                  </TableCell>
                  <TableCell>
                    <AttendanceDetailsDialog attendance={attendance} />
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
