"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";

import type { DepartmentRecord } from "@acme/db/schema";
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

interface SetDepartmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  departments: DepartmentRecord[] | undefined;
  currentDepartmentName?: string;
}

export function SetDepartmentDialog({
  isOpen,
  onClose,
  userId,
  departments,
  currentDepartmentName,
}: SetDepartmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const updateMutation = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: () => {
        toast.success("Cập nhật vai trò thành công");
        setSelectedDepartmentId("");
        setOpen(false);
        onClose();
        queryClient.invalidateQueries({
          queryKey: trpc.user.all.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const handleSubmit = async () => {
    if (!selectedDepartmentId) return;

    setIsSubmitting(true);
    try {
      await updateMutation.mutate({
        id: userId,
        departmentId: selectedDepartmentId,
      });
    } catch (error) {
      toast.error("Không thể cập nhật phòng ban cho người dùng này", {
        description: "Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedDepartmentId("");
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật phòng ban</DialogTitle>
          <DialogDescription>
            Chọn phòng ban cho người dùng này. Nếu không có phòng ban nào được
            chọn, người dùng sẽ không thuộc về bất kỳ phòng ban nào.
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
                {selectedDepartmentId
                  ? departments?.find(
                      (department: DepartmentRecord) =>
                        department.id === selectedDepartmentId,
                    )?.name
                  : (currentDepartmentName ?? "Chọn phòng ban...")}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search role..." />
                <CommandList>
                  <CommandEmpty>No role found.</CommandEmpty>
                  <CommandGroup>
                    {departments?.map((department: DepartmentRecord) => (
                      <CommandItem
                        key={department.id}
                        value={department.name}
                        onSelect={() => {
                          setSelectedDepartmentId(department.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedDepartmentId === department.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {department.name}
                      </CommandItem>
                    ))}
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
            disabled={!selectedDepartmentId || isSubmitting}
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
