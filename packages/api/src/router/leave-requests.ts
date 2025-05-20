import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { eq } from "@acme/db";
import {
  CreateLeaveRequestsSchema,
  LeaveRequests,
  UpdateLeaveRequestsSchema,
} from "@acme/db/schema";

import { checkPermissionOrThrow } from "../libs";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const leaveRequestRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    await checkPermissionOrThrow(
      ctx,
      "leaveRequest",
      "getAll",
      "Không có quyền xem quyền truy cập",
    );
    return await ctx.db
      .select()
      .from(LeaveRequests)
      .orderBy(LeaveRequests.createdAt);
  }),
  getById: protectedProcedure
    .input(CreateLeaveRequestsSchema)
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "leaveRequest",
        "getById",
        "Không có quyền xem quyền truy cập",
      );
      const { userId } = input;
      const result = await ctx.db
        .select()
        .from(LeaveRequests)
        .where(eq(LeaveRequests.id, userId))
        .limit(1)
        .execute();
      if (!result.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm ngày nghỉ phép",
        });
      }
      return result[0];
    }),
  update: protectedProcedure
    .input(UpdateLeaveRequestsSchema)
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "leaveRequest",
        "update",
        "Không có quyền cập nhật quyền truy cập",
      );
      const { id, startDate, endDate, ...updateData } = input;
      const updated = await ctx.db
        .update(LeaveRequests)
        .set({
          ...updateData,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        })
        .where(eq(LeaveRequests.id, id))
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
        "leaveRequest",
        "delete",
        "Không có quyền xóa quyền truy cập",
      );
      const { id } = input;
      const deleted = await ctx.db
        .delete(LeaveRequests)
        .where(eq(LeaveRequests.id, id))
        .returning();
      return deleted;
    }),
});
