"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

import type { IUser } from "@acme/db";
import { toast } from "@acme/ui/toast";

import { updateStatus } from "~/app/actions/auth";

interface UserStatusModalContextType {
  isOpen: boolean;
  selectedUser: IUser | null;
  openModal: (user: IUser) => void;
  closeModal: () => void;
  updateUserStatus: (email: string, newStatus: string) => Promise<void>;
}

const UserStatusModalContext = createContext<
  UserStatusModalContextType | undefined
>(undefined);

export const UserStatusModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const router = useRouter();
  const openModal = (user: IUser) => {
    setSelectedUser(user);
    setIsOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsOpen(false);
  };

  const updateUserStatus = async (email: string, newStatus: string) => {
    if (!selectedUser) return;

    try {
      const update = await updateStatus(email, newStatus);
      if (update.success) {
        toast.success(`✅ Cập nhật status thành công: ${selectedUser.email}`);
        window.location.href = "/users";
      } else {
        toast.error("❌ Cập nhật thất bại");
      }
    } catch (error) {
      toast.error("Lỗi: " + error);
    } finally {
      closeModal();
    }
  };

  return (
    <UserStatusModalContext.Provider
      value={{ isOpen, selectedUser, openModal, closeModal, updateUserStatus }}
    >
      {children}
    </UserStatusModalContext.Provider>
  );
};

export const useUserStatusModal = () => {
  const ctx = useContext(UserStatusModalContext);
  if (!ctx) {
    throw new Error(
      "useUserStatusModal must be used within UserStatusModalProvider",
    );
  }
  return ctx;
};
