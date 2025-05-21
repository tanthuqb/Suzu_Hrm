"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { DepartmentRecord } from "@acme/db/schema";
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
  name: z.string().min(1, "Name is required").max(100),
  departmentId: z.string().uuid("Invalid department ID"),
});

interface AddPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: DepartmentRecord[];
  isLoading: boolean;
}

export function AddPositionDialog({
  open,
  onOpenChange,
  departments,
  isLoading,
}: AddPositionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      departmentId: "",
    },
  });

  const createPositionMuation = useMutation(
    trpc.position.create.mutationOptions({
      onSuccess: () => {
        toast("Tạo vị trí thành công", {
          description: "Vị trí mới đã được thêm vào.",
        });
        setIsSubmitting(false);
        form.reset();
        onOpenChange(false);
        queryClient.invalidateQueries({
          queryKey: trpc.position.getAll.queryKey(),
        });
      },
      onError: (error) => {
        toast("Error", {
          description: error.message,
        });
        setIsSubmitting(false);
        form.reset();
      },
    }),
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await createPositionMuation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Position</DialogTitle>.
          <DialogDescription id="dialog-desc">
            Quản lý vị trí của công ty
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
                {isSubmitting ? "Đang khởi tạo..." : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
