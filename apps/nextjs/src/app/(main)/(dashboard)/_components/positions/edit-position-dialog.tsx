"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { DepartmentRecord, PositionRecord } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { toast } from "@acme/ui/toast";

import { useTRPC } from "~/trpc/react";

const formSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(100),
  departmentId: z.string().uuid("Invalid department ID"),
});

interface EditPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: PositionRecord;
  departments: DepartmentRecord[];
  isLoading: boolean;
}

export function EditPositionDialog({
  open,
  onOpenChange,
  position,
  departments,
  isLoading,
}: EditPositionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: position.id,
      name: position.name,
      departmentId: position.departmentId,
    },
  });

  const updatePositionMutaion = useMutation(
    trpc.position.update.mutationOptions({
      onSuccess: () => {
        toast("Cập nhật vị trí thành công", {
          description: "Vị trí đã được cập nhật thành công.",
        });
        onOpenChange(false);
        form.reset();
        queryClient.invalidateQueries({
          queryKey: trpc.position.getAll.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.position.getById.queryKey(),
        });
        setIsSubmitting(false);
      },
      onError: (error) => {
        toast("Lỗi khi cập nhật vị trí", {
          description: error.message,
        });
      },
    }),
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await updatePositionMutaion.mutateAsync({
        id: values.id,
        name: values.name,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Position</DialogTitle>
          <DialogDescription id="dialog-desc">
            Thay đổi vị trí
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Position name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
