import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { AttendanceInput } from "@acme/db";
import { createServerClient } from "@acme/supabase";
import { getEmailToUserIdMap } from "@acme/utils";

import { protectedProcedure } from "../trpc";

export const hrRouter: TRPCRouterRecord = {
  importAttendances: protectedProcedure
    .input(z.array(z.record(z.any()))) // raw Excel JSON
    .mutation(async ({ input }) => {
      const supabase = await createServerClient();
      const results: AttendanceInput[] = [];

      const emailToIdMap = await getEmailToUserIdMap(supabase);
      if (!emailToIdMap) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Không thể lấy danh sách người dùng từ Supabase",
        });
      }

      const headerRow = input[0];
      if (!headerRow) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Header row is missing or invalid.",
        });
      }
      const validDayKeys = Object.keys(headerRow).filter((key) =>
        /^\d+$/.test(key),
      );

      const now = new Date();
      const baseMonth = `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, "0")}`;

      for (let i = 1; i < input.length; i++) {
        const row = input[i];
        const email = row["Email Address [Required]"]?.trim().toLowerCase();
        const userId = emailToIdMap.get(email);
        if (!userId) continue;

        for (const key of validDayKeys) {
          const rawValue = row[key];
          if (!rawValue) continue;

          const normalized = normalizeStatus(String(rawValue));
          if (!normalized) continue;

          const day = key.padStart(2, "0");
          const dateStr = `${baseMonth}-${day}T00:00:00+07:00`;
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) continue;

          results.push({
            userId,
            date: date.toISOString(),
            status: normalized,
          });
        }
      }

      // Ghi vào database
      const { data, error: insertError } = await supabase
        .from("attendances")
        .insert(results);

      if (insertError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: insertError.message,
        });
      }

      return {
        insertedCount: results.length,
      };
    }),
  previewAttendances: protectedProcedure
    .input(z.array(z.record(z.any())))
    .mutation(async ({ input }) => {
      const supabase = await createServerClient();
      const emailToIdMap = await getEmailToUserIdMap(supabase);
      console.log("Preview results:", emailToIdMap);
      const headerRow = input[0];
      if (!headerRow) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dữ liệu file không hợp lệ.",
        });
      }

      const validDayKeys = Object.keys(headerRow).filter((key) =>
        /^\d+$/.test(key),
      );

      const now = new Date();
      const baseMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const results: {
        userId: string;
        date: string;
        status: string;
      }[] = [];

      for (let i = 1; i < input.length; i++) {
        const row = input[i];
        const email = row["Email Address [Required]"]?.trim().toLowerCase();
        const userId = emailToIdMap.get(email);
        if (!userId) continue;
        for (const key of validDayKeys) {
          const rawValue = row[key];
          if (!rawValue) continue;

          const normalized = normalizeStatus(String(rawValue));
          if (!normalized) continue;

          const date = new Date(
            `${baseMonth}-${key.padStart(2, "0")}T00:00:00+07:00`,
          );
          if (isNaN(date.getTime())) continue;

          results.push({
            userId,
            date: date.toISOString(),
            status: normalized,
          });
        }
      }
      console.log("Preview result:", results);
      return results;
    }),
};
