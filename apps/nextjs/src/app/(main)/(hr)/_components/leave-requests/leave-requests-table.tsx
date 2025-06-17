"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Edit, Search, Trash2, X } from "lucide-react";

import { approvalStatusEnum } from "@acme/db";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@acme/ui/alert-dialog";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { DatePicker } from "@acme/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { toast } from "@acme/ui/toast";

import type { LeaveRequestFormValues } from "./leave-request-form";
import type {
  GetAllLeaveRequestsResponse,
  LeaveRequestRecord,
} from "~/libs/data/leaverequest";
import { toLeaveRequestUpdateDTO } from "~/dtos/leaveRequest";
import { useTRPC } from "~/trpc/react";
import { LeaveRequestForm } from "./leave-request-form";

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function convertStatus(status: string): string {
  switch (status) {
    case approvalStatusEnum.APPROVED:
      return "Đã duyệt";
    case approvalStatusEnum.REJECTED:
      return "Đã từ chối";
    case approvalStatusEnum.PENDING:
      return "Đang chờ duyệt";
    default:
      return status;
  }
}

export function LeaveRequestsTable({
  userId,
  initialData,
  leaveRequest,
  currentUserRole,
}: {
  initialData?: GetAllLeaveRequestsResponse;
  userId: string;
  leaveRequest?: LeaveRequestRecord | null;
  currentUserRole?: string;
}) {
  const [searchName, setSearchName] = useState("");
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [selectedRequest, setSelectedRequest] =
    useState<LeaveRequestRecord | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const trpc = useTRPC();
  const router = useRouter();

  const canApprove =
    currentUserRole?.toLocaleLowerCase() === "admin" ||
    currentUserRole?.toLocaleLowerCase() === "hr";

  const leavesRequests = initialData?.leaveRequests;

  const filteredRequests: LeaveRequestRecord[] = leaveRequest
    ? [leaveRequest]
    : (leavesRequests?.filter((request) => {
        const nameMatch = request.name
          .toLowerCase()
          .includes(searchName.toLowerCase());
        const startDateMatch =
          !startDateFilter || new Date(request.start_date) >= startDateFilter;
        const endDateMatch =
          !endDateFilter || new Date(request.end_date) <= endDateFilter;
        return nameMatch && startDateMatch && endDateMatch;
      }) ?? []);

  const deleteMutation = useMutation(
    trpc.leaveRequest.delete.mutationOptions({
      onSuccess: () => {
        toast("Leave request deleted successfully", {
          description: "The leave request has been deleted.",
        });
        setIsDeleteDialogOpen(false);
        router.refresh();
      },
      onError: (error) => {
        toast("Error deleting leave request", {
          description: error.message,
        });
      },
    }),
  );

  const handleView = (request: LeaveRequestRecord) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (request: LeaveRequestRecord) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync({
      id: selectedRequest?.id!,
    });
    router.refresh();
    setIsDeleteDialogOpen(false);
  };

  const resetFilters = () => {
    setSearchName("");
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
  };

  const updateMutation = useMutation(
    trpc.leaveRequest.update.mutationOptions({
      onSuccess: () => {
        toast("Leave request updated successfully", {
          description: "The leave request has been updated.",
        });
        setIsViewDialogOpen(false);
        router.refresh();
      },
      onError: (error) => {
        toast("Error updating leave request", {
          description: error.message,
        });
      },
    }),
  );

  const handleUpdate = async (formValues: LeaveRequestFormValues) => {
    const rowDto = toLeaveRequestUpdateDTO(formValues, selectedRequest, userId);
    await updateMutation.mutateAsync(rowDto);
  };

  const isLoading = false;

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên..."
            className="pl-9"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          {searchName && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchName("")}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Xóa tìm kiếm</span>
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <DatePicker
              placeholder="Từ ngày"
              date={startDateFilter}
              onDateChange={setStartDateFilter}
              className="w-[150px] pl-9"
            />
          </div>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <DatePicker
              placeholder="Đến ngày"
              date={endDateFilter}
              onDateChange={setEndDateFilter}
              className="w-[150px] pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={resetFilters}
            size="sm"
            className="h-9"
          >
            <X className="mr-1 h-4 w-4" />
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {/* Results info */}
      {(searchName || startDateFilter || endDateFilter) && (
        <div className="text-sm text-muted-foreground">
          {filteredRequests.length === 0 ? (
            <span>Không tìm thấy kết quả phù hợp</span>
          ) : (
            <span>Hiển thị {filteredRequests.length} kết quả</span>
          )}
          {searchName && <span> cho tìm kiếm "{searchName}"</span>}
          {(startDateFilter || endDateFilter) && (
            <span>
              {" "}
              trong khoảng thời gian
              {startDateFilter
                ? ` từ ${format(startDateFilter, "dd/MM/yyyy")}`
                : ""}
              {endDateFilter
                ? ` đến ${format(endDateFilter, "dd/MM/yyyy")}`
                : ""}
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Họ tên</TableHead>
              <TableHead className="font-semibold">Chức vụ</TableHead>
              <TableHead className="font-semibold">Phòng Ban</TableHead>
              <TableHead className="font-semibold">Từ ngày</TableHead>
              <TableHead className="font-semibold">Đến ngày</TableHead>
              <TableHead className="font-semibold">Lý do</TableHead>
              <TableHead className="font-semibold">Trạng Thái</TableHead>
              <TableHead className="text-right font-semibold">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-muted-foreground">
                      {searchName || startDateFilter || endDateFilter
                        ? "Không tìm thấy kết quả phù hợp"
                        : "Chưa có yêu cầu nghỉ phép nào."}
                    </div>
                    {(searchName || startDateFilter || endDateFilter) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                      >
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request: LeaveRequestRecord) => (
                <TableRow key={request.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {request.userName}
                  </TableCell>
                  <TableCell>
                    {request.departmentName ? (
                      <Badge variant="outline">{request.departmentName}</Badge>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {request.positionName ?? "N/A"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(request.start_date, "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(request.end_date, "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={request.reason}>
                      {request.reason}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={
                        request.approvedStatus === approvalStatusEnum.APPROVED
                          ? "default"
                          : request.approvedStatus ===
                              approvalStatusEnum.REJECTED
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {convertStatus(request.approvedStatus)}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleView(request)}
                        className="h-8 w-8"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(request)}
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit/View Dialog */}
      {selectedRequest && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cập nhật nghỉ phép</DialogTitle>
              <DialogDescription>
                Cập nhật yêu cầu nghỉ phép cho {selectedRequest.name}
              </DialogDescription>
            </DialogHeader>
            <LeaveRequestForm
              defaultValues={{
                ...selectedRequest,
                departmentId: selectedRequest.departmentId ?? "",
                departmentName: selectedRequest.departmentName ?? "",
                start_date: new Date(selectedRequest.start_date),
                end_date: new Date(selectedRequest.end_date),
                approvalStatus: selectedRequest.approvedStatus,
              }}
              isLoading={updateMutation.isPending}
              onSubmit={handleUpdate}
              onCancel={() => setIsViewDialogOpen(false)}
              isApproveDisabled={!canApprove}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      {selectedRequest && (
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa nghỉ phép</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có muốn xóa nghỉ phép{" "}
                <strong>{selectedRequest.name}</strong>? Hành động này không thể
                hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
