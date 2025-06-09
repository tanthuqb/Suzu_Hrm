"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";

import type { PositionRecord } from "@acme/db/schema";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@acme/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
import { toast } from "@acme/ui/toast";

import { useTRPC } from "~/trpc/react";

interface SetPositionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  positions: Pick<PositionRecord, "id" | "name">[] | null;
  currentPositionName?: string;
  refetchUsers: () => void;
}

export function SetPositionDialog({
  isOpen,
  onClose,
  userId,
  positions,
  currentPositionName,
  refetchUsers,
}: SetPositionDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trpc = useTRPC();

  const updateMutation = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: () => {
        toast.success("Cập nhật vai trò thành công");
        setSelectedPositionId("");
        setOpen(false);
        onClose();
        refetchUsers();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const handleSubmit = async () => {
    if (!selectedPositionId) return;

    setIsSubmitting(true);
    try {
      await updateMutation.mutate({
        id: userId,
        positionId: selectedPositionId,
      });
    } catch (error) {
      toast.error("Khôngg thể cập nhật vị trí", {
        description: "Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedPositionId("");
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật vị trí</DialogTitle>
          <DialogDescription>
            Câp nhật vị trí cho người dùng này. Nhấn lưu khi bạn hoàn tất.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="justify-between"
              >
                {selectedPositionId
                  ? positions?.find(
                      (position: Pick<PositionRecord, "id" | "name">) =>
                        position.id === selectedPositionId,
                    )?.name
                  : (currentPositionName ?? "Chọn vị trí...")}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search role..." />
                <CommandList>
                  <CommandEmpty>Không có vị trí nào.</CommandEmpty>
                  <CommandGroup>
                    {positions?.map(
                      (position: Pick<PositionRecord, "id" | "name">) => (
                        <CommandItem
                          key={position.id}
                          value={position.name}
                          onSelect={() => {
                            setSelectedPositionId(position.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedPositionId === position.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {position.name}
                        </CommandItem>
                      ),
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedPositionId || isSubmitting}
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
