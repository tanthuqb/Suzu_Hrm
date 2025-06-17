import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { AttendanceStatus } from "@acme/db";
import { createServerClient } from "@acme/supabase";
import {
  getEmailToUserIdMap,
  isValidDateString,
  parseStatusSymbols,
} from "@acme/utils";

import { checkPermissionOrThrow } from "../libs";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export interface AttendanceInput {
  user_id: string;
  status: string;
  email: string;
  date: string;
}

export const hrRouter = createTRPCRouter({
  previewAttendances: protectedProcedure
    .input(z.array(z.record(z.any())))
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "hr",
        "previewAttendances",
        "Không có quyền xem dữ liệu chấm công",
      );

      if (input.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dữ liệu không hợp lệ.",
        });
      }

      const supabase = await createServerClient();
      const emailToUserId = await getEmailToUserIdMap(supabase);

      const headerRow = input[0];
      const validDayKeys = Object.keys(headerRow!).filter((key) =>
        /^\d+$/.test(key),
      );

      const results: AttendanceInput[] = [];

      for (let i = 1; i < input.length; i++) {
        const row = input[i];
        if (!row) continue;

        function normalizeKey(key: string): string {
          return key.normalize("NFKC").replace(/\s+/g, "").trim().toLowerCase();
        }

        const normalizedRow = Object.fromEntries(
          Object.entries(row).map(([k, v]) => [normalizeKey(k), v]),
        );

        const keysheetName = "sheetName";

        const rawSheet =
          normalizedRow[keysheetName] ??
          normalizedRow.sheetname ??
          row.sheetName ??
          row.SheetName;
        const [yearStr, monthStr] =
          typeof rawSheet === "string" ? rawSheet.trim().split("-") : [];
        const parsedYear = Number(yearStr);
        const parsedMonth = Number(monthStr);
        const paddedMonth = monthStr?.padStart(2, "0");

        console.log(
          `📄 Dòng ${i + 1}: sheetName = ${rawSheet}, keysheetName = ${keysheetName}`,
        );

        if (
          !parsedYear ||
          isNaN(parsedYear) ||
          !parsedMonth ||
          isNaN(parsedMonth) ||
          parsedMonth < 1 ||
          parsedMonth > 12
        ) {
          console.warn(`❌ Dòng ${i + 1}: sheetName không hợp lệ`, rawSheet);
          continue;
        }
        let email: string | null = null;
        for (const value of Object.values(row)) {
          if (typeof value === "string" && value.includes("@")) {
            email = value.normalize("NFKC").trim().toLowerCase();
            break;
          }
        }

        const emailKey = Object.keys(row).find((k) =>
          k.toLowerCase().includes("email"),
        );
        email =
          emailKey && typeof row[emailKey] === "string"
            ? row[emailKey].normalize("NFKC").trim().toLowerCase()
            : null;

        if (!email || !emailToUserId.has(email)) {
          console.warn(
            `⚠️ Dòng ${i + 1}: Email không tồn tại trong Supabase: ${email}`,
          );
          continue;
        }

        const user_id = emailToUserId.get(email)!;
        console.log(
          `✅ Dòng ${i + 1}: Đang xử lý dữ liệu cho user_id ${user_id} (${email})`,
        );

        for (const dayKey of validDayKeys) {
          const rawValue = String(row[dayKey] ?? "").trim();
          if (!rawValue) continue;

          const statuses = parseStatusSymbols(rawValue);
          for (const status of statuses) {
            const paddedDay = dayKey.padStart(2, "0");
            const dateStr = `${parsedYear}-${paddedMonth}-${paddedDay}`;
            if (!isValidDateString(dateStr)) {
              console.warn(`⚠️ Bỏ qua ngày không hợp lệ: ${dateStr}`);
              continue;
            }

            results.push({
              user_id,
              email,
              date: new Date(`${dateStr}T00:00:00+07:00`).toISOString(),
              status,
            });
          }
        }
      }

      if (results.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "❌ Không có dòng dữ liệu nào hợp lệ.",
        });
      }

      return results;
    }),

  importAttendances: protectedProcedure
    .input(
      z.object({
        month: z
          .string()
          .regex(/^\d{4}-\d{2}$/, "Tháng phải có định dạng YYYY-MM"),
        items: z.array(
          z.object({
            user_id: z.string().uuid(),
            date: z.string().datetime(),
            status: z.nativeEnum(AttendanceStatus),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { month, items } = input;

      if (!items.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "❌ Dữ liệu không hợp lệ.",
        });
      }

      await checkPermissionOrThrow(
        ctx,
        "hr",
        "importAttendances",
        "Không có quyền nhập dữ liệu chấm công",
      );

      // ✅ Lọc các dòng hợp lệ (theo date ISO format)
      const validInput = items.filter((item) =>
        isValidDateString(item.date.slice(0, 10)),
      );

      if (!validInput.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "❌ Không có dòng dữ liệu nào hợp lệ.",
        });
      }
      const [year, monthStr] = month.split("-");
      const lastDay = new Date(Number(year), Number(monthStr), 0).getDate();
      const startDate = `${month}-01`;
      const endDate = `${month}-${lastDay.toString().padStart(2, "0")}`;

      const supabase = await createServerClient();

      // ✅ Xoá toàn bộ dữ liệu chấm công cũ cho các user_id trong khoảng tháng đó
      const { error: deleteError } = await supabase
        .from("attendances")
        .delete()
        .in(
          "user_id",
          validInput.map((i) => i.user_id),
        )
        .gte("date", startDate)
        .lte("date", endDate);

      if (deleteError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Lỗi khi xoá dữ liệu cũ: ${deleteError.message}`,
        });
      }

      // ✅ Insert lại toàn bộ dữ liệu mới
      const { error: insertError } = await supabase
        .from("attendances")
        .insert(validInput);

      if (insertError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Lỗi khi thêm dữ liệu mới: ${insertError.message}`,
        });
      }

      return {
        insertedCount: validInput.length,
        message: `✅ Đã nhập lại toàn bộ ${validInput.length} dòng dữ liệu tháng ${month}.`,
      };
    }),
});
