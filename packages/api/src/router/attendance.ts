import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { alias, and, eq } from "@acme/db";
import {
  Attendance,
  attendanceStatusEnum,
  CreateAttendanceSchema,
  Department,
  HRMUser,
  LeaveRequests,
} from "@acme/db/schema";

import { checkPermissionOrThrow } from "../libs";
import { protectedProcedure } from "../trpc";

export const attendanceRouter = {
  getAll: protectedProcedure.query(async ({ ctx }) => {
    await checkPermissionOrThrow(
      ctx,
      "attendance",
      "getAll",
      "Không có quyền xem quyền truy cập",
    );

    const User = alias(HRMUser, "User");
    const Approver = alias(HRMUser, "Approver");

    return await ctx.db
      .select({
        id: Attendance.id,
        date: Attendance.date,
        userId: Attendance.userId,
        userName: User.name,
        userEmail: User.email,
        status: Attendance.status,
        isRemote: Attendance.isRemote,
        remoteReason: Attendance.remoteReason,
        leaveRequestId: Attendance.leaveRequestId,
        leaveRequestStatus: LeaveRequests.approvalStatus,
        leaveRequestReason: LeaveRequests.reason,
        leaveRequestsApprovedBy: LeaveRequests.approvedBy,
        approvedByName: Approver.name,
        office: Department.office,
        departmentName: Department.name,
      })
      .from(Attendance)
      .leftJoin(LeaveRequests, eq(Attendance.leaveRequestId, LeaveRequests.id))
      .leftJoin(User, eq(LeaveRequests.userId, User.id))
      .leftJoin(Approver, eq(LeaveRequests.approvedBy, Approver.id))
      .leftJoin(Department, eq(Department.id, User.departmentId))
      .orderBy(Attendance.date);
  }),

  getByLeaveRequestAndUserId: protectedProcedure
    .input(
      z.object({
        leaveRequestId: z.string().uuid(),
        userId: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "attendance",
        "getByLeaveRequestAndUserId",
        "Không có quyền xem quyền truy cập",
      );
      const { leaveRequestId, userId } = input;
      const result = await ctx.db
        .select()
        .from(Attendance)
        .where(
          and(
            eq(Attendance.leaveRequestId, leaveRequestId),
            eq(Attendance.userId, String(userId)),
          ),
        )
        .limit(1)
        .execute();
      if (!result.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy ngày chấm công",
        });
      }
      return result[0];
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
          date: new Date(date),
          userId,
          isRemote,
          remoteReason,
          ...rest,
        })
        .returning();
      return created;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["1", "P", "P1", "Pk", "L", "Nb", "W"]),
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
} satisfies TRPCRouterRecord;
