import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { LeaveBalanceRecord } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import { useTRPC } from "~/trpc/react";

interface SetLeaveBalanceProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  leaveBalance?: LeaveBalanceRecord;
  currentLeaveBalance?: LeaveBalanceRecord;
  refetchUsers: () => void;
}

export function SetLeaveBalanceDialog({
  isOpen,
  onClose,
  userId,
  leaveBalance,
  currentLeaveBalance,
  refetchUsers,
}: SetLeaveBalanceProps) {
  const [totalDays, setTotalDays] = useState(leaveBalance?.totalDays ?? 12);
  const [usedDays, setUsedDays] = useState(leaveBalance?.usedDays ?? 0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const trpc = useTRPC();
  const remainingDays = Math.max(0, totalDays - usedDays);
  const updateMutation = useMutation(
    trpc.leaveRequest.upsertLeaveBalance.mutationOptions({
      onSuccess: () => {
        toast.success("Cập nhật ngày phép thành công");
        onClose();
        refetchUsers();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateMutation.mutate({
        id: leaveBalance?.id!,
        userId,
        totalDays,
        usedDays,
        remainingDays,
        year: leaveBalance?.year ?? new Date().getFullYear(),
      });
    } catch (error) {
      toast.error("Cập nhật thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật ngày phép</DialogTitle>
          <DialogDescription>
            Nhập số ngày phép cho nhân viên này.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <label className="flex flex-col gap-1">
            Tổng ngày phép
            <Input
              type="number"
              value={totalDays}
              min={0}
              onChange={(e) => setTotalDays(Number(e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1">
            Đã sử dụng
            <Input
              type="number"
              value={usedDays}
              min={0}
              onChange={(e) => setUsedDays(Number(e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1">
            Còn lại
            <Input
              type="number"
              value={remainingDays}
              min={0}
              readOnly
              disabled
            />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
