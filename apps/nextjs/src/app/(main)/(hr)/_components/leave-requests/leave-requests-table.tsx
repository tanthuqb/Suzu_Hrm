"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, Search, Trash2 } from "lucide-react";

import type { LeaveRequestsRecord } from "@acme/db/schema";
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
import { toLeaveRequestUpdateDTO } from "~/dtos/leaveRequest";
import { useTRPC } from "~/trpc/react";
import { LeaveRequestForm } from "./leave-request-form";

export function LeaveRequestsTable({
  userId,
  leaveRequestId,
}: {
  userId: string;
  leaveRequestId?: string;
}) {
  const [searchName, setSearchName] = useState("");
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [selectedRequest, setSelectedRequest] =
    useState<LeaveRequestsRecord | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: leavesRequests } = useQuery({
    ...trpc.leaveRequest.getAll.queryOptions(),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const filteredRequests = leaveRequestId
    ? leavesRequests?.filter((request) => request.id === leaveRequestId)
    : leavesRequests?.filter((request) => {
        const nameMatch = request.name
          .toLowerCase()
          .includes(searchName.toLowerCase());
        const startDateMatch =
          !startDateFilter || request.startDate >= startDateFilter;
        const endDateMatch = !endDateFilter || request.endDate <= endDateFilter;
        return nameMatch && startDateMatch && endDateMatch;
      });

  const deleteMutation = useMutation(
    trpc.leaveRequest.delete.mutationOptions({
      onSuccess: () => {
        toast("Leave request deleted successfully", {
          description: "The leave request has been deleted.",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (error) => {
        toast("Error deleting leave request", {
          description: error.message,
        });
      },
    }),
  );

  const handleView = (request: LeaveRequestsRecord) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (request: LeaveRequestsRecord) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync({
      id: selectedRequest?.id!,
    });
    queryClient.invalidateQueries({
      queryKey: trpc.leaveRequest.getAll.queryKey(),
    });
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
        queryClient.invalidateQueries({
          queryKey: trpc.leaveRequest.getAll.queryKey(),
        });
      },
      onError: (error) => {
        toast("Error updating leave request", {
          description: error.message,
        });
      },
    }),
  );

  const handleUpdate = async (formValues: LeaveRequestFormValues) => {
    const dto = toLeaveRequestUpdateDTO(formValues, selectedRequest, userId);
    await updateMutation.mutateAsync(dto);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            className="pl-8"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <DatePicker
            placeholder="Start date"
            date={startDateFilter}
            onDateChange={setStartDateFilter}
            className="w-[150px]"
          />
          <DatePicker
            placeholder="End date"
            date={endDateFilter}
            onDateChange={setEndDateFilter}
            className="w-[150px]"
          />
          <Button variant="outline" onClick={resetFilters}>
            Reset filters
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No leave requests found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests?.map((request: LeaveRequestsRecord) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.name}</TableCell>
                  <TableCell>{request.departmentId ?? "N/A"}</TableCell>
                  <TableCell>{format(request.createdAt, "PPP")}</TableCell>
                  <TableCell>{format(request.endDate, "PPP")}</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleView(request)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(request)}
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
              <DialogDescription>Cập nhật yêu cầu nghỉ phép</DialogDescription>
            </DialogHeader>
            <LeaveRequestForm
              defaultValues={{
                ...selectedRequest,
                approvalStatus:
                  selectedRequest.approvalStatus === null
                    ? undefined
                    : selectedRequest.approvalStatus,
                approvedBy:
                  selectedRequest.approvedBy === null
                    ? undefined
                    : selectedRequest.approvedBy,
                approvedAt:
                  selectedRequest.approvedAt === null
                    ? undefined
                    : selectedRequest.approvedAt,
              }}
              isLoading={updateMutation.isPending}
              isReadOnly={false}
              onSubmit={handleUpdate}
              onCancel={() => setIsViewDialogOpen(false)}
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
                <strong>{selectedRequest.name}</strong>?. Hành động không thể
                quay lại
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
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
