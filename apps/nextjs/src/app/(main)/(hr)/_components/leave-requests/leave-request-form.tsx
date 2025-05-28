"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { ApprovalStatus } from "@acme/db";
import { approvalStatusEnum, AttendanceStatus } from "@acme/db";
import { Button } from "@acme/ui/button";
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

const leaveRequestSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  userId: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.enum(Object.values(AttendanceStatus) as [string, ...string[]], {
    required_error: "Attendance status is required.",
    invalid_type_error: "Attendance status must be a valid option.",
  }),
  reason: z
    .string()
    .max(1000, "Reason must be at most 1000 characters")
    .nullable()
    .optional(),
  approvalStatus: z.enum(
    Object.values(approvalStatusEnum) as [string, ...string[]],
    {
      required_error: "Approval status is required",
      invalid_type_error: "Approval status must be a valid option.",
    },
  ),
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional(),
  createdAt: z.date().optional(),
});

export type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;

interface LeaveRequestFormProps {
  defaultValues?: Partial<LeaveRequestFormValues>;
  isLoading?: boolean;
  isReadOnly?: boolean;
  onSubmit: (data: LeaveRequestFormValues) => void;
  onCancel: () => void;
}

export function LeaveRequestForm({
  defaultValues,
  isLoading,
  isReadOnly,
  onSubmit,
  onCancel,
}: LeaveRequestFormProps) {
  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      name: "",
      userId: "",
      departmentId: "",
      status: AttendanceStatus.WorkDay,
      reason: "",
      approvalStatus: approvalStatusEnum.PENDING,
      approvedBy: "",
      approvedAt: undefined,
      createdAt: undefined,
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input {...form.register("name")} disabled={isReadOnly} />
        {form.formState.errors.name && (
          <span className="text-sm text-red-500">
            {form.formState.errors.name.message}
          </span>
        )}
      </div>
      <div>
        <Label>Department ID</Label>
        <Input {...form.register("departmentId")} disabled={isReadOnly} />
        {form.formState.errors.departmentId && (
          <span className="text-sm text-red-500">
            {form.formState.errors.departmentId.message}
          </span>
        )}
      </div>
      <div>
        <Label>Reason</Label>
        <Textarea {...form.register("reason")} disabled={isReadOnly} />
        {form.formState.errors.reason && (
          <span className="text-sm text-red-500">
            {form.formState.errors.reason.message}
          </span>
        )}
      </div>
      <div>
        <Label>Status</Label>
        <Select
          value={form.watch("approvalStatus")}
          onValueChange={(value) => form.setValue("approvalStatus", value)}
          disabled={isReadOnly}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(approvalStatusEnum).map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.approvalStatus && (
          <span className="text-sm text-red-500">
            {form.formState.errors.approvalStatus.message}
          </span>
        )}
      </div>
      {!isReadOnly && (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>
      )}
    </form>
  );
}
