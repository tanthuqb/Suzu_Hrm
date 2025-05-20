"use client";

import { useId } from "react";
import dynamic from "next/dynamic";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { AuthUser } from "@acme/db";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";

import { sendLeaveRequest } from "~/actions/eForm";

const Calendar = dynamic(
  () => import("@acme/ui/calendar").then((mod) => mod.Calendar),
  { ssr: false },
);

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  userId: z.string().min(1, { message: "User ID is required." }),
  department: z.string().min(1, { message: "Department is required." }),
  startDate: z
    .date()
    .optional()
    .refine((val) => val instanceof Date, {
      message: "Start date is required when field is not empty.",
    }),

  endDate: z
    .date()
    .optional()
    .refine((val) => val instanceof Date, {
      message: "End date is required when field is not empty.",
    }),
  reason: z
    .string()
    .min(10, { message: "Reason must be at least 10 characters." }),
});

export default function WFHForm({ user }: { user: AuthUser }) {
  const uid = useId();
  const startUid = `${uid}-start`;
  const endUid = `${uid}-end`;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: `${user.lastName} ${user.firstName}`,
      userId: user.id,
      department: user.departments?.name,
      reason: "",
      startDate: undefined,
      endDate: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { error } = await sendLeaveRequest(values);

    if (error) {
      toast.error("Gửi thất bại", { description: error.message });
      return;
    }

    toast.message("Gửi thành công", {
      description: "Yêu cầu làm việc từ xa của bạn đã được gửi.",
    });

    form.reset();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <>
                <input type="hidden" {...field} />
                <FormItem>
                  <FormLabel>Employee ID</FormLabel>
                  <FormControl>
                    <div className="select-none rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-800">
                      {field.value}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="John Doe"
                    value={field.value ?? ""}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input
                  placeholder="Engineering"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => {
              return (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          id={`trigger-${startUid}`}
                          aria-describedby={`content-${startUid}`}
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            field.value instanceof Date &&
                              "text-muted-foreground",
                          )}
                        >
                          {field.value instanceof Date ? (
                            format(field.value, "PPP", {
                              locale: vi,
                            })
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      id={`content-${startUid}`}
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        id={`trigger-${endUid}`}
                        aria-describedby={`content-${endUid}`}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          field.value instanceof Date &&
                            "text-muted-foreground",
                        )}
                      >
                        {field.value instanceof Date ? (
                          format(field.value, "PPP", {
                            locale: vi,
                          })
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    id={`content-${endUid}`}
                  >
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Work From Home</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please provide details about why you need to work from home..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-center pt-4">
          <Button type="submit" size="lg" className="w-full px-10 md:w-auto">
            Submit Request
          </Button>
        </div>
      </form>
    </Form>
  );
}
