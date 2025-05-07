"use client";

import { createContext, useContext, useState } from "react";

import type { IUser } from "@acme/db";
import { toast } from "@acme/ui/toast";

import { updateStatus } from "~/app/actions/auth";
import { useSupabaseSession } from "~/app/hooks/useSession";
import { useSupabaseClient } from "~/app/hooks/useSupabaseClient";
import { env } from "~/env";

async function callGoogleDisableAccess(
  session: any,
  email: string,
  suspend: boolean,
) {
  const Body = {
    name: "Functions",
    email: email,
    suspend: suspend,
  };
  try {
    if (!session.access_token) {
      throw new Error("Không lấy được access token");
    }

    const response = await fetch(
      env.NEXT_PUBLIC_SUPABASE_URL + "/functions/v1/google-disable-access",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(Body),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to call Edge Function");
    }
    return await response.json();
  } catch (error) {
    console.error("Error calling Edge Function:", error);
    throw error;
  }
}

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
  const { session, error } = useSupabaseSession();
  if (error) {
    console.error("Error getting session:", error);
  }

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
    await callGoogleDisableAccess(session, email, newStatus !== "active");
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
