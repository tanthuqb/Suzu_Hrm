import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { eq } from "@acme/db";
import { Attendance, CreateAttendanceSchema } from "@acme/db/schema";

import { checkPermissionOrThrow } from "../libs";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const attendanceRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    await checkPermissionOrThrow(
      ctx,
      "attendance",
      "getAll",
      "Không có quyền xem quyền truy cập",
    );
    return await ctx.db.select().from(Attendance).orderBy(Attendance.date);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "attendance",
        "getById",
        "Không có quyền xem quyền truy cập",
      );
      const { id } = input;
      const result = await ctx.db
        .select()
        .from(Attendance)
        .where(eq(Attendance.id, id))
        .limit(1)
        .execute();
      if (!result.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm ngày chám công",
        });
      }
      return result[0];
    }),
  create: protectedProcedure
    .input(CreateAttendanceSchema)
    .mutation(async ({ input, ctx }) => {
      const { date, userId, isRemote, remoteReason, ...rest } = input;
      const [created] = await ctx.db
        .insert(Attendance)
        .values({
          ...rest,
          date: new Date(date),
          userId,
          isRemote,
          remoteReason,
        })
        .returning();
      return created;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum([
          "1",
          "W",
          "P",
          "P1",
          "P2",
          "BH",
          "Rk",
          "x/2",
          "L",
          "Nb",
          "Nb1",
          "Nb2",
          "CT",
          "BD",
          "BC",
          "BC1",
          "BC2",
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "attendance",
        "update",
        "Không có quyền cập nhật quyền truy cập",
      );
      const { id, status } = input;
      const [updated] = await ctx.db
        .update(Attendance)
        .set({ status })
        .where(eq(Attendance.id, id))
        .returning();
      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy ngày chấm công",
        });
      }
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "attendance",
        "delete",
        "Không có quyền xóa quyền truy cập",
      );
      const { id } = input;
      const deleted = await ctx.db
        .delete(Attendance)
        .where(eq(Attendance.id, id))
        .returning();
      return deleted;
    }),
});
