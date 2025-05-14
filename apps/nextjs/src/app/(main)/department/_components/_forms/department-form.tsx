"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { DBUser } from "@acme/db";
import type { DepartmentRecord } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from "@acme/ui/textarea";

const formSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  position: z
    .string()
    .max(50, "Position must be at most 50 characters")
    .default("staff"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .nullable()
    .optional(),
});

interface DepartmentFormProps {
  department?: DepartmentRecord | null;
  users?: DBUser[];
  isLoading?: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function DepartmentForm({
  users = [],
  department,
  isLoading = false,
  onSubmit,
  onCancel,
}: DepartmentFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: department
      ? {
          userId: department.userId,
          name: department.name,
          position: department.position ?? "staff",
          description: department.description ?? undefined,
        }
      : {
          userId: "",
          name: "",
          position: "staff",
          description: undefined,
        },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (department) {
      onSubmit({
        ...values,
        id: department.id,
        createdAt: department.createdAt,
        updatedAt: new Date(),
      });
    } else {
      onSubmit(values);
    }
  };

  console.log("users", users);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* User Select
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={isLoading ? "Loading..." : "Select a user"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.lastName} {u.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Cập nhật thông tin phòng ban cho người dùng này.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        {/* Name & Code */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Engineering" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ManagerId & Position */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  The position category for this department.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Department description..."
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {department ? "Update Department" : "Create Department"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
