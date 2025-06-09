import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@acme/db";
import {
  Attendance,
  CreateLeaveBalanceSchema,
  CreateLeaveRequestsSchema,
  LeaveBalances,
  LeaveRequests,
  UpdateLeaveRequestsSchema,
} from "@acme/db/schema";

import { checkPermissionOrThrow } from "../libs";
import { protectedProcedure } from "../trpc";

export const leaveRequestRouter = {
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
      const {
        id,
        startDate,
        endDate,
        approvalStatus,
        approvedAt,
        status,
        reason,
        userId,
        ...updateData
      } = input;
      const updated = await ctx.db
        .update(LeaveRequests)
        .set({
          ...updateData,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          approvedAt: new Date(approvedAt),
          approvalStatus: approvalStatus,
        })
        .where(eq(LeaveRequests.id, id))
        .returning();
      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy ngày chấm công",
        });
      }
      if (approvalStatus == "approved") {
        // Lấy leave balance hiện tại
        const [leaveBalance] = await ctx.db
          .select()
          .from(LeaveBalances)
          .where(
            and(
              eq(LeaveBalances.userId, String(userId)),
              eq(LeaveBalances.year, new Date().getFullYear()),
            ),
          )
          .limit(1)
          .execute();

        if (!leaveBalance) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Không tìm thấy ngày phép cho người dùng này",
          });
        }

        const daysRequested = 1;
        // Kiểm tra số ngày phép còn lại
        if (leaveBalance.remainingDays < daysRequested) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Đã hết ngày phép còn lại",
          });
        }
        // Cập nhật số ngày đã sử dụng và còn lại
        const newUsedDays = leaveBalance.usedDays + daysRequested;
        const newRemainingDays = leaveBalance.totalDays - newUsedDays;

        await ctx.db
          .update(LeaveBalances)
          .set({
            usedDays: newUsedDays,
            remainingDays: newRemainingDays,
          })
          .where(eq(LeaveBalances.id, leaveBalance.id));

        // Thêm attendance record
        const [attendance] = await ctx.db
          .select()
          .from(Attendance)
          .where(
            and(
              eq(Attendance.userId, String(userId)),
              eq(Attendance.leaveRequestId, id),
            ),
          );
        // Nếu đã có attendance record, không thêm mới
        if (attendance) {
          return false;
        } else {
          await ctx.db.insert(Attendance).values({
            userId: userId,
            date: new Date(),
            status: status,
            isRemote: false,
            remoteReason: reason,
            leaveRequestId: id,
          });
        }
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

  upsertLeaveBalance: protectedProcedure
    .input(
      CreateLeaveBalanceSchema.extend({
        id: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "leaveRequest",
        "upsertLeaveBalance",
        "Không có quyền tạo/cập nhật ngày phép",
      );
      const {
        userId,
        year,
        totalDays,
        usedDays = 0,
        remainingDays,
        id,
      } = input;

      // Kiểm tra đã có leave balance cho user & year chưa
      const [existing] = await ctx.db
        .select()
        .from(LeaveBalances)
        .where(
          and(eq(LeaveBalances.userId, userId), eq(LeaveBalances.year, year)),
        )
        .limit(1)
        .execute();

      if (existing) {
        // Nếu đã có, update
        const updated = await ctx.db
          .update(LeaveBalances)
          .set({
            totalDays,
            usedDays,
            remainingDays: remainingDays ?? totalDays - usedDays,
            year,
          })
          .where(eq(LeaveBalances.id, existing.id))
          .returning();
        return updated;
      } else {
        // Nếu chưa có, insert
        const inserted = await ctx.db
          .insert(LeaveBalances)
          .values({
            userId,
            year,
            totalDays,
            usedDays,
            remainingDays: remainingDays ?? totalDays - usedDays,
          })
          .returning();
        return inserted;
      }
    }),
  getLeaveBalanceByUserId: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      // await checkPermissionOrThrow(
      //   ctx,
      //   "leaveRequest",
      //   "getLeaveBalanceByUserId",
      //   "Không có quyền xem ngày phép của người dùng",
      // );
      const { userId } = input;
      const result = await ctx.db
        .select()
        .from(LeaveBalances)
        .where(
          and(
            eq(LeaveBalances.userId, userId),
            eq(LeaveBalances.year, new Date().getFullYear()),
          ),
        )
        .orderBy(desc(LeaveBalances.year))
        .execute();
      if (!result.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy ngày phép cho người dùng này",
        });
      }
      return (
        result[0] ?? {
          userId,
          year: new Date().getFullYear(),
          totalDays: 0,
          usedDays: 0,
          remainingDays: 0,
        }
      );
    }),
} satisfies TRPCRouterRecord;
