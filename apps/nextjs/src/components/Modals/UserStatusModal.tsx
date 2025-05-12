"use client";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

import { useUserStatusModal } from "~/context/UserStatusModalContext";

export function UserStatusModal() {
  const { isOpen, selectedUser, closeModal, updateUserStatus } =
    useUserStatusModal();
  if (!selectedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái người dùng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            Bạn có chắc muốn cập nhật trạng thái cho <b>{selectedUser.email}</b>
            ?
          </p>
          <div className="flex justify-end gap-2">
            <Button onClick={closeModal} variant="outline">
              Huỷ
            </Button>
            <Button
              onClick={() => updateUserStatus(selectedUser.email, "active")}
            >
              Kích hoạt
            </Button>
            <Button
              onClick={() => updateUserStatus(selectedUser.email, "suspended")}
              variant="destructive"
            >
              Vô hiệu hoá
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
