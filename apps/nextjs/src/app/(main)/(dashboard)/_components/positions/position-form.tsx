"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

import type { Position } from "~/libs/data/positions";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  department_id: z.string().optional(),
});

interface PositionFormProps {
  position?: Position | null;
  departments?: DepartmentRecord[] | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function PositionForm({
  position,
  onSubmit,
  departments,
  onCancel,
}: PositionFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: position
      ? {
          name: position.name,
          department_id: position.department_id.toString(),
        }
      : {
          name: "",
          department_id: "",
        },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (position) {
      onSubmit({
        ...values,
      });
    } else {
      onSubmit(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Name  */}
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vị trí</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Engineering" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Department Select */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
          <FormField
            control={form.control}
            name="department_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phòng Ban</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
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
          />
        </div>
        {/* Description */}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {position ? "Cập nhật vị trí" : "Tạo vị trí"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
