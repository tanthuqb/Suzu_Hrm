"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { PositionRecord } from "@acme/db/schema";
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
import { toast } from "@acme/ui/toast";

import { useTRPC } from "~/trpc/react";

interface DeletePositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: PositionRecord;
}

export function DeletePositionDialog({
  open,
  onOpenChange,
  position,
}: DeletePositionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const deletePositionMuation = useMutation(
    trpc.position.delete.mutationOptions({
      onSuccess: () => {
        toast("Đã xóa vị trí", {
          description: `"${position.name}" đã được gỡ bỏ.`,
        });
        onOpenChange(false);
        queryClient.invalidateQueries({
          queryKey: trpc.position.getAll.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.position.getById.queryKey(),
        });
        router.refresh();
      },
      onError: (error) => {
        toast("Xóa thất bại", {
          description: error.message,
        });
      },
    }),
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePositionMuation.mutateAsync({ id: position.id });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the position "{position.name}". This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
