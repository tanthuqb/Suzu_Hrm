"use client";

import type React from "react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApprovalStatus } from "@acme/db";
import { approvalStatusEnum } from "@acme/db";
import { Button } from "@acme/ui/button";
import { DatePicker } from "@acme/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";

import { useTRPC } from "~/trpc/react";

const approvalStatusOptions = Object.values(approvalStatusEnum);

interface LeaveRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequest: any;
  userId: string;
  setIsViewDialogOpen: (isOpen: boolean) => void;
}

export function LeaveRequestDialog({
  isOpen,
  onClose,
  leaveRequest,
  userId,
  setIsViewDialogOpen,
}: LeaveRequestDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<ApprovalStatus>(
    leaveRequest?.approvalStatus ?? approvalStatusEnum.PENDING,
  );

  const [formData, setFormData] = useState({
    name: leaveRequest.name,
    department: leaveRequest.department,
    startDate: leaveRequest.startDate,
    endDate: leaveRequest.endDate,
    reason: leaveRequest.reason,
    userId: leaveRequest.userId,
    status: leaveRequest.status,
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, startDate: date || prev.startDate }));
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, endDate: date || prev.endDate }));
  };

  const updateMutation = useMutation(
    trpc.leaveRequest.update.mutationOptions({
      onSuccess: () => {
        console.log("Leave request updated successfully");
        setIsViewDialogOpen(false);
      },
      onError: (error) => {
        console.error("Error updating leave request:", error);
      },
    }),
  );

  const createAttandanceMutation = useMutation(
    trpc.attendance.create.mutationOptions({}),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      ...formData,
      id: leaveRequest.id,
      approvalStatus: selectedStatus,
      approvedBy: userId,
      approvedAt: new Date(),
      startDate: formData.startDate
        ? typeof formData.startDate === "string"
          ? formData.startDate
          : (formData.startDate as Date).toISOString()
        : "",
      endDate: formData.endDate
        ? typeof formData.endDate === "string"
          ? formData.endDate
          : (formData.endDate as Date).toISOString()
        : "",
    });

    if (selectedStatus === "approved") {
      await createAttandanceMutation.mutateAsync({
        date: formData.startDate
          ? typeof formData.startDate === "string"
            ? formData.startDate
            : (formData.startDate as Date).toISOString()
          : "",
        userId: leaveRequest.userId,
        isRemote: false,
        remoteReason: formData.reason,
        status: leaveRequest.status,
      });
    }

    queryClient.invalidateQueries({
      queryKey: trpc.leaveRequest.getAll.queryKey(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Leave Request</DialogTitle>
            <DialogDescription>
              Update the leave request details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={userId !== leaveRequest.userId}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                disabled={userId !== leaveRequest.userId}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Start Date</Label>
              <div className="col-span-3">
                <DatePicker
                  date={formData.startDate}                  
                  onDateChange={handleStartDateChange}
                  className="w-full"
                  
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">End Date</Label>
              <div className="col-span-3">
                <DatePicker
                  date={formData.endDate}
                  onDateChange={handleEndDateChange}
                  className="w-full"
                />
              </div>
            </div> */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                disabled={userId !== leaveRequest.userId}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Status
            </Label>
            <div className="flex items-center gap-2">
              <Select
                value={selectedStatus}
                onValueChange={(value: string) =>
                  setSelectedStatus(value as ApprovalStatus)
                }
                disabled={userId == leaveRequest.userId}
                defaultValue={leaveRequest.approvalStatus}
              >
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {approvalStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
