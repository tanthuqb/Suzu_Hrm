"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";

import type { RoleRecord } from "@acme/db/schema";
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

interface SetRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  roles: Pick<RoleRecord, "id" | "name">[] | null;
  currentRoleName?: string;
  refetchUsers: () => void;
}

export function SetRoleDialog({
  isOpen,
  onClose,
  userId,
  roles,
  currentRoleName,
  refetchUsers,
}: SetRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trpc = useTRPC();

  const updateMutation = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: () => {
        toast.success("Cập nhật vai trò thành công");
        setSelectedRoleId("");
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
    if (!selectedRoleId) return;

    setIsSubmitting(true);
    try {
      await updateMutation.mutate({
        id: userId,
        roleId: selectedRoleId,
      });
    } catch (error) {
      console.error("Failed to update user role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedRoleId("");
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set User Role</DialogTitle>
          <DialogDescription>
            Change the role for this user. Click save when you're done.
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
                {selectedRoleId
                  ? roles?.find((role) => role.id === selectedRoleId)?.name
                  : currentRoleName || "Select role..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search role..." />
                <CommandList>
                  <CommandEmpty>No role found.</CommandEmpty>
                  <CommandGroup>
                    {roles?.map((role) => (
                      <CommandItem
                        key={role.id}
                        value={role.name}
                        onSelect={() => {
                          setSelectedRoleId(role.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedRoleId === role.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {role.name}
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
            disabled={!selectedRoleId || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
