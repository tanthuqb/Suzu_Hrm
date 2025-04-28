"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

// Define the form schema with Zod
const formSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be at most 20 characters"),
  managerId: z.string().uuid("Invalid manager ID format").nullable().optional(),
  position: z
    .string()
    .max(50, "Position must be at most 50 characters")
    .default("staff"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .nullable()
    .optional(),
  createdById: z
    .string()
    .uuid("Invalid creator ID format")
    .nullable()
    .optional(),
});

// Define the props for the component
interface Department {
  id: number;
  userId: string;
  name: string;
  code: string;
  managerId: string | null;
  position: string;
  description: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DepartmentFormProps {
  department?: Department;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function DepartmentForm({
  department,
  onSubmit,
  onCancel,
}: DepartmentFormProps) {
  // Initialize the form with default values or existing department data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: department
      ? {
          userId: department.userId,
          name: department.name,
          code: department.code,
          managerId: department.managerId ?? undefined,
          position: department.position,
          description: department.description ?? undefined,
          createdById: department.createdById ?? undefined,
        }
      : {
          userId: "", // In a real app, this would be the current user's ID
          name: "",
          code: "",
          managerId: undefined,
          position: "staff",
          description: "",
          createdById: "", // In a real app, this would be the current user's ID
        },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (department) {
      // If editing, include the ID and timestamps
      onSubmit({
        ...values,
        id: department.id,
        createdAt: department.createdAt,
        updatedAt: new Date(),
      });
    } else {
      // If creating, just pass the form values
      onSubmit(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User ID</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="550e8400-e29b-41d4-a716-446655440000"
                />
              </FormControl>
              <FormDescription>
                The ID of the user associated with this department.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department Code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ENG" />
                </FormControl>
                <FormDescription>
                  A unique code for the department (e.g., ENG, MKT).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="managerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manager ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="550e8400-e29b-41d4-a716-446655440001"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormDescription>
                  The ID of the manager for this department (optional).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The position category for this department.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <FormField
          control={form.control}
          name="createdById"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Created By ID</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="550e8400-e29b-41d4-a716-446655440002"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormDescription>
                The ID of the user who created this department (optional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
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
