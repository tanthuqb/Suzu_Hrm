"use client";

import { useEffect, useTransition } from "react";
import { pdf } from "@react-pdf/renderer";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

import type { CreateSalarySlipInput, SalarySlipRecord } from "@acme/db/schema";
import { CreateSalarySlipSchema } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import { sendSalaryEmail } from "~/actions/sendEmailSalary";
import { registerFontForClient } from "~/components/SalaryPDFTemplates/registerFont.client";
import { SalarySlipPDF } from "~/components/SalaryPDFTemplates/SalarySlipPDF";
import { useTRPC } from "~/trpc/react";

export default function SalarySlipSmartForm({
  id,
  userId,
  name,
}: {
  id?: string;
  userId: string;
  name: string;
}) {
  const trpc = useTRPC();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    schema: CreateSalarySlipSchema,
    defaultValues: {
      userId,
      month: "",
      basicSalary: 0,
      workingSalary: 0,
      bonus: 0,
      allowance: 0,
      otherIncome: 0,
      totalIncome: 0,
      socialInsuranceBase: 0,
      socialInsuranceDeducted: 0,
      unionFee: 0,
      taxableIncome: 0,
      personalDeduction: 0,
      familyDeduction: 0,
      taxIncomeFinal: 0,
      personalIncomeTax: 0,
      advance: 0,
      otherDeductions: 0,
      totalDeductions: 0,
      netIncome: 0,
      status: "pending",
    },
  });

  const updateMutation = useMutation(
    trpc.salary.update.mutationOptions({
      onSuccess: () => {
        toast.success("Cập nhật phiếu lương thành công");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const createMutation = useMutation(
    trpc.salary.create.mutationOptions({
      onSuccess: () => {
        toast.success("Tạo mới phiếu lương thành công");
      },
    }),
  );

  const slip = id
    ? (
        useSuspenseQuery(trpc.salary.getById.queryOptions({ id })) as {
          data: SalarySlipRecord | undefined;
        }
      ).data
    : undefined;

  function sanitizeSlip(
    slip: Partial<SalarySlipRecord>,
  ): CreateSalarySlipInput {
    return {
      userId: slip.userId!,
      month: slip.month!,
      basicSalary: slip.basicSalary ?? 0,
      workingSalary: slip.workingSalary ?? 0,
      bonus: slip.bonus ?? 0,
      allowance: slip.allowance ?? 0,
      otherIncome: slip.otherIncome ?? 0,
      totalIncome: slip.totalIncome ?? 0,
      socialInsuranceBase: slip.socialInsuranceBase ?? 0,
      socialInsuranceDeducted: slip.socialInsuranceDeducted ?? 0,
      unionFee: slip.unionFee ?? 0,
      taxableIncome: slip.taxableIncome ?? 0,
      personalDeduction: slip.personalDeduction ?? 0,
      familyDeduction: slip.familyDeduction ?? 0,
      taxIncomeFinal: slip.taxIncomeFinal ?? 0,
      personalIncomeTax: slip.personalIncomeTax ?? 0,
      advance: slip.advance ?? 0,
      otherDeductions: slip.otherDeductions ?? 0,
      totalDeductions: slip.totalDeductions ?? 0,
      netIncome: slip.netIncome ?? 0,
      status: slip.status ?? "pending",
    };
  }

  useEffect(() => {
    if (slip) {
      form.reset(sanitizeSlip(slip));
    }
  }, [form, slip]);

  const formatCurrency = (val: string | number) => {
    const number =
      typeof val === "number" ? val : Number(val.replace(/\D/g, ""));
    return number.toLocaleString("vi-VN");
  };

  const parseCurrency = (val: string) => {
    return Number(val.replace(/\D/g, ""));
  };

  const compute = (data: any) => {
    const totalIncome =
      data.workingSalary + data.bonus + data.allowance + data.otherIncome;

    const totalDeductions =
      (data.socialInsuranceDeducted ?? 0) +
      (data.unionFee ?? 0) +
      (data.personalIncomeTax ?? 0) +
      (data.advance ?? 0) +
      (data.otherDeductions ?? 0);

    const netIncome = totalIncome - totalDeductions;

    return { totalIncome, totalDeductions, netIncome };
  };

  const handleOpenPDF = async () => {
    registerFontForClient();
    const blob = await pdf(<SalarySlipPDF data={form.getValues()} />).toBlob();
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL, "_blank");
  };

  const handleSendEmail = () => {
    const values = {
      ...form.getValues(),
      name,
    };

    startTransition(async () => {
      const res = await sendSalaryEmail({
        email: "hoangconglock15@gmail.com",
        data: values,
      });
      if (res.success) {
        toast.success("Đã gửi lại email phiếu lương!");
      } else {
        toast.error("Không gửi được email");
        console.error(res.error);
      }
    });
  };

  const renderForm = (mode: "create" | "update") => {
    const fields: {
      name: keyof CreateSalarySlipInput;
      label: string;
      isCurrency: boolean;
    }[] = [
      { name: "month", label: "Tháng", isCurrency: false },
      { name: "basicSalary", label: "Lương cơ bản", isCurrency: true },
      { name: "workingSalary", label: "Lương ngày công", isCurrency: true },
      { name: "bonus", label: "Thưởng", isCurrency: true },
      { name: "allowance", label: "Phụ cấp", isCurrency: true },
      { name: "otherIncome", label: "Thu nhập khác", isCurrency: true },
      {
        name: "socialInsuranceBase",
        label: "Lương đóng BHXH",
        isCurrency: true,
      },
      { name: "socialInsuranceDeducted", label: "Trừ BHXH", isCurrency: true },
      { name: "unionFee", label: "Phí công đoàn", isCurrency: true },
      { name: "taxableIncome", label: "Lương tính thuế", isCurrency: true },
      {
        name: "personalDeduction",
        label: "Giảm trừ bản thân",
        isCurrency: true,
      },
      { name: "familyDeduction", label: "Giảm trừ gia cảnh", isCurrency: true },
      {
        name: "taxIncomeFinal",
        label: "Thu nhập tính thuế sau giảm trừ",
        isCurrency: true,
      },
      { name: "personalIncomeTax", label: "Thuế TNCN", isCurrency: true },
      { name: "advance", label: "Tạm ứng", isCurrency: true },
      { name: "otherDeductions", label: "Các khoản khác", isCurrency: true },
    ];

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            const { totalIncome, totalDeductions, netIncome } = compute(data);
            const payload = {
              ...data,
              totalIncome,
              totalDeductions,
              netIncome,
              status: "completed",
            };

            if (mode === "update" && slip?.id) {
              updateMutation.mutate({ ...payload, id: slip.id });
            } else {
              createMutation.mutate(payload);
            }
          })}
          className="grid gap-4"
        >
          {fields.map((f) => (
            <FormField<CreateSalarySlipInput>
              key={f.name}
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{f.label}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={
                        f.isCurrency
                          ? formatCurrency(field.value ?? 0)
                          : (field.value ?? "")
                      }
                      onChange={(e) => {
                        field.onChange(
                          f.isCurrency
                            ? parseCurrency(e.target.value)
                            : e.target.value,
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <div className="flex gap-2">
            <Button type="submit">
              {mode === "update"
                ? updateMutation.isPending
                  ? "Đang cập nhật..."
                  : "Cập nhật phiếu lương"
                : createMutation.isPending
                  ? "Đang tạo..."
                  : "Tạo phiếu lương"}
            </Button>

            {mode === "update" && (
              <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={handleOpenPDF}>
                  Mở PDF
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  onClick={handleSendEmail}
                  disabled={isPending}
                >
                  {isPending ? "Đang gửi..." : "Gửi lại email"}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    );
  };

  const mode = id && slip ? "update" : "create";
  return renderForm(mode);
}
