// ✅ hrRouter.ts: refactor sang createTRPCRouter
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { AttendanceInput } from "@acme/db";
import { AttendanceStatus } from "@acme/db";
import { createServerClient } from "@acme/supabase";
import {
  getCurrentVietnamMonth,
  getEmployCodeToUserIdMap,
  parseStatusSymbols,
} from "@acme/utils";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const hrRouter = createTRPCRouter({
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

        let employCode: string | undefined;
        if (typeof row["Mã NV"] === "string") {
          employCode = row["Mã NV"].trim().toLowerCase();
        }

        const user_id = employCode
          ? EmployCodeToIdMap.get(employCode)
          : undefined;
        if (!user_id) continue;

        for (const key of validDayKeys) {
          const rawValue = String(row[key] ?? "").trim();
          if (!rawValue) continue;

          const statuses = parseStatusSymbols(rawValue);
          for (const status of statuses) {
            const date = new Date(
              `${baseMonth}-${key.padStart(2, "0")}T00:00:00+07:00`,
            );
            const dateOnly = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
            );
            if (!isNaN(date.getTime())) {
              results.push({
                user_id,
                date: dateOnly.toISOString(),
                status,
              });
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
          status: z.nativeEnum(AttendanceStatus),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      const supabase = await createServerClient();
      const { error } = await supabase.from("attendances").insert(input);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return {
        insertedCount: input.length,
        message: "Nhập dữ liệu thành công.",
      };
    }),
});
