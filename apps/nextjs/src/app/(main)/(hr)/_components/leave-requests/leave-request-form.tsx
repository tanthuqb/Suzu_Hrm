"use client";

import App from "next/app";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { approvalStatusEnum } from "@acme/db";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
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
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được quá 100 ký tự"),
  userId: z.string().optional(),
  departmentId: z.string().optional(),
  departmentName: z.string().optional(),
  status: z.string().optional(),
  start_date: z.date({
    required_error: "Ngày bắt đầu là bắt buộc",
  }),
  end_date: z.date({
    required_error: "Ngày kết thúc là bắt buộc",
  }),
  reason: z
    .string()
    .min(1, "Lý do nghỉ phép là bắt buộc")
    .max(1000, "Lý do không được quá 1000 ký tự"),
  approvalStatus: z.enum(
    Object.values(approvalStatusEnum) as [string, ...string[]],
    {
      required_error: "Trạng thái duyệt là bắt buộc",
      invalid_type_error: "Trạng thái duyệt không hợp lệ",
    },
  ),
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional(),
  notes: z.string().optional(),
});

export type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;

interface LeaveRequestFormProps {
  defaultValues?: Partial<LeaveRequestFormValues>;
  isLoading?: boolean;
  isReadOnly?: boolean;
  isApproveDisabled?: boolean;
  onSubmit: (data: LeaveRequestFormValues) => void;
  onCancel: () => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status: string) => {
  if (!status) return "";
  switch (status.toLowerCase()) {
    case "approved":
      return "Đã duyệt";
    case "pending":
      return "Chờ duyệt";
    case "rejected":
      return "Từ chối";
    default:
      return status;
  }
};

export function LeaveRequestForm({
  defaultValues,
  isLoading,
  isReadOnly,
  isApproveDisabled,
  onSubmit,
  onCancel,
}: LeaveRequestFormProps) {
  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      name: "",
      userId: "",
      departmentName: "",
      start_date: defaultValues?.start_date,
      end_date: defaultValues?.end_date,
      reason: "",
      approvalStatus: approvalStatusEnum.PENDING,
      approvedBy: "",
      notes: "",
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit(
    (data) => {
      onSubmit(data);
    },
    (errors) => {
      console.log("Validation errors:", errors);
    },
  );

  const watchedStartDate =
    form.watch("start_date") ?? defaultValues?.start_date;
  const watchedEndDate = form.watch("end_date") ?? defaultValues?.end_date;
  const watchedApprovalStatus =
    form.watch("approvalStatus") ?? defaultValues?.approvalStatus;

  const totalDays =
    watchedStartDate && watchedEndDate
      ? Math.ceil(
          (watchedEndDate.getTime() - watchedStartDate.getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1
      : 0;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Thông tin nhân viên</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Họ tên *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  disabled={isReadOnly}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="departmentName">Phòng ban</Label>
                <Input
                  id="name"
                  {...form.register("departmentName")}
                  disabled={isReadOnly}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Chi tiết nghỉ phép</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Ngày bắt đầu + Ngày kết thúc  */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <Label>Ngày bắt đầu *</Label>
                <div className="mt-1 rounded border bg-muted px-3 py-2 text-base">
                  {watchedStartDate ? (
                    format(watchedStartDate, "dd/MM/yyyy")
                  ) : (
                    <span>Chưa chọn</span>
                  )}
                </div>
              </div>

              <div className="w-1/2">
                <Label>Ngày kết thúc *</Label>
                <div className="mt-1 rounded border bg-muted px-3 py-2 text-base">
                  {watchedEndDate ? (
                    format(watchedEndDate, "dd/MM/yyyy")
                  ) : (
                    <span>Chưa chọn</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tổng số ngày nghỉ */}
            {totalDays > 0 && (
              <div className="rounded-md bg-muted p-3">
                <div className="text-sm">
                  <span className="font-medium">Tổng số ngày nghỉ:</span>{" "}
                  <span className="inline-block align-middle">
                    <Badge variant="secondary">{totalDays} ngày</Badge>
                  </span>
                </div>
              </div>
            )}

            {/* Lý do nghỉ phép */}
            <div>
              <Label htmlFor="reason">Lý do nghỉ phép *</Label>
              <Textarea
                id="reason"
                {...form.register("reason")}
                disabled={isReadOnly}
                className="mt-1"
                placeholder="Nhập lý do nghỉ phép..."
                rows={3}
              />
              {form.formState.errors.reason && (
                <span className="mt-1 text-sm text-destructive">
                  {form.formState.errors.reason.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Approval Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Trạng thái duyệt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Trạng thái hiện tại</Label>
              <div className="mt-2">
                <Badge className={getStatusColor(watchedApprovalStatus)}>
                  {getStatusLabel(watchedApprovalStatus)}
                </Badge>
              </div>
            </div>

            {!isApproveDisabled && (
              <div>
                <Label>Cập nhật trạng thái</Label>
                <Select
                  value={form.watch("approvalStatus")}
                  onValueChange={(value) =>
                    form.setValue("approvalStatus", value)
                  }
                  disabled={isApproveDisabled}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(approvalStatusEnum).map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getStatusColor(status)}
                            variant="outline"
                          >
                            {getStatusLabel(status)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.approvalStatus && (
                  <span className="mt-1 text-sm text-destructive">
                    {form.formState.errors.approvalStatus.message}
                  </span>
                )}
              </div>
            )}

            {defaultValues?.approvedBy && (
              <div>
                <Label>Duyệt bởi</Label>
                <Input
                  value={defaultValues.approvedBy}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
            )}

            {defaultValues?.approvedAt && (
              <div>
                <Label>Ngày duyệt</Label>
                <Input
                  value={format(defaultValues.approvedAt, "dd/MM/yyyy HH:mm")}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>
      </form>
    </div>
  );
}
