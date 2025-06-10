"use client";

import { useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { AuthUser } from "@acme/db";
import {
  approvalStatusEnum,
  AttendanceStatus,
  AttendanceStatusLabel,
} from "@acme/db";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Calendar } from "@acme/ui/calendar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";

import type { LeaveBalanceRecord } from "~/libs/data/leaverequest";
import { sendLeaveRequest } from "~/actions/eForm";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  userId: z.string().min(1, { message: "User ID is required." }),
  position: z.string().optional(),
  email: z.string().email({
    message: "Email must be a valid email address.",
  }),
  departmentId: z.string().optional(),
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
  userInDepartment: z.string().optional(),
  reason: z
    .string()
    .min(10, { message: "Reason must be at least 10 characters." }),
  status: z.enum(Object.values(AttendanceStatus) as [string, ...string[]], {
    required_error: "Attendance status is required.",
    invalid_type_error: "Attendance status must be a valid option.",
  }),
  ApprovalStatus: z.enum(
    Object.values(approvalStatusEnum) as [string, ...string[]],
    {
      required_error: "Approval status is required",
      invalid_type_error: "Approval status must be a valid option.",
    },
  ),
  ApprovalBy: z.string().optional(),
  ApprovalAt: z.date().optional(),
});

export default function WFHForm({
  user,
  leaveBalance,
}: {
  user: AuthUser;
  leaveBalance: LeaveBalanceRecord;
}) {
  const uid = useId();
  const startUid = `${uid}-start`;
  const endUid = `${uid}-end`;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: `${user.lastName} ${user.firstName}`,
      email: user.email ?? "",
      userId: user.id,
      position: user.positions?.name ?? "",
      departmentId: user.departments?.id,
      userInDepartment: user.departments?.name ?? "",
      reason: "",
      startDate: undefined,
      endDate: undefined,
      status: AttendanceStatus.WorkDay,
      ApprovalStatus: approvalStatusEnum.PENDING,
      ApprovalBy: "",
      ApprovalAt: undefined,
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
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <div className="space-y-2">
            <div className="flex items-center rounded-md bg-white bg-opacity-50 p-2 shadow-sm">
              <span className="mr-1 text-blue-600">📆</span>
              <strong className="mr-1">Ngày phép còn lại:</strong>
              {leaveBalance.remaining_days ?? 0} ngày
            </div>
            <div className="flex items-center rounded-md bg-white bg-opacity-50 p-2 shadow-sm">
              <span className="mr-1 text-orange-500">⏱️</span>
              <strong className="mr-1">Đã sử dụng:</strong>
              {leaveBalance.used_days ?? 0} ngày
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <div className="w-full">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-medium text-gray-700">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={true}
                      readOnly={true}
                      className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 p-2 text-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-medium text-gray-700">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      value={field.value ?? ""}
                      className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  required={true}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AttendanceStatusLabel).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full">
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <>
                <input type="hidden" {...field} />
                <FormItem>
                  <FormLabel className="block font-medium text-gray-700">
                    Position
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={true}
                      readOnly={true}
                      value={
                        field.value === null ||
                        field.value === undefined ||
                        field.value === ""
                          ? "Not assigned"
                          : field.value
                      }
                      className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 p-2 text-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </>
            )}
          />
        </div>

        <div className="w-full">
          <FormField
            control={form.control}
            name="userInDepartment"
            render={({ field }) => (
              <>
                <input type="hidden" {...field} />
                <FormItem>
                  <FormLabel className="block font-medium text-gray-700">
                    Department
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={true}
                      readOnly={true}
                      value={
                        field.value === null ||
                        field.value === undefined ||
                        field.value === ""
                          ? "Not assigned"
                          : field.value
                      }
                      className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 p-2 text-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </>
            )}
          />
        </div>

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
              <FormLabel>Reason </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập lý do xin phép ..."
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
            Gửi Yêu Cầu
          </Button>
        </div>
      </form>
    </Form>
  );
}
