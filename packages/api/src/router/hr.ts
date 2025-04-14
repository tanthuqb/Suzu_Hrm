import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { AttendanceInput } from "@acme/db";
import { createServerClient } from "@acme/supabase";
import {
  getCurrentVietnamMonth,
  getEmployCodeToUserIdMap,
  parseStatusSymbols,
} from "@acme/utils";

import { protectedProcedure } from "../trpc";

export const hrRouter: TRPCRouterRecord = {
  previewAttendances: protectedProcedure
    .input(z.array(z.record(z.any())))
    .mutation(async ({ input }) => {
      const supabase = await createServerClient();
      const EmployCodeToIdMap = await getEmployCodeToUserIdMap(supabase);

      const headerRow = input[0];
      if (!headerRow)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dữ liệu không hợp lệ.",
        });

      const validDayKeys = Object.keys(headerRow).filter((key) =>
        /^\d+$/.test(key),
      );
      const baseMonth = getCurrentVietnamMonth();
      const results: AttendanceInput[] = [];

      for (let i = 1; i < input.length; i++) {
        const row = input[i];
        if (!row) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Dữ liệu không hợp lệ.",
          });
        }
        const employCode = row["Mã NV"]?.trim().toLowerCase();
        const user_id = EmployCodeToIdMap.get(employCode);
        if (!user_id) continue;

        for (const key of validDayKeys) {
          if (!row)
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Dữ liệu không hợp lệ.",
            });
          const rawValue = String(row[key] || "").trim();
          if (!rawValue) continue;
          const statuses = parseStatusSymbols(rawValue);
          for (const status of statuses) {
            const date = new Date(
              `${baseMonth}-${key.padStart(2, "0")}T00:00:00+07:00`,
            );
            if (!isNaN(date.getTime())) {
              results.push({ user_id, date: date.toISOString(), status });
            }
          }
        }
      }

      return results;
    }),

  importAttendances: protectedProcedure
    .input(
      z.array(
        z.object({
          user_id: z.string().uuid(),
          date: z.string().datetime(),
          status: z.string(),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      const supabase = await createServerClient();

      // Lấy danh sách dữ liệu đã có để so sánh
      const { data: existing, error: fetchError } = await supabase
        .from("attendances")
        .select("user_id, date, status")
        .in(
          "user_id",
          input.map((i) => i.user_id),
        );

      if (fetchError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: fetchError.message,
        });
      }

      // Tạo map từ user_id + date => status
      const existingMap = new Map(
        existing.map((row) => [`${row.user_id}_${row.date}`, row.status]) || [],
      );

      // Lọc ra bản ghi thực sự cần insert/update
      const toUpsert = input.filter((item) => {
        const key = `${item.user_id}_${item.date}`;
        return existingMap.get(key) !== item.status;
      });

      // Thực hiện upsert nếu có dòng cần thiết
      if (toUpsert.length > 0) {
        const { error } = await supabase.from("attendances").upsert(toUpsert, {
          onConflict: "user_id, date",
        });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }
      }

      return {
        insertedCount: toUpsert.length,
        skippedCount: input.length - toUpsert.length,
        skippedRows:
          input.length === toUpsert.length
            ? []
            : input.filter((item) => {
                const key = `${item.user_id}_${item.date}`;
                return existingMap.get(key) === item.status;
              }),
      };
    }),
};
