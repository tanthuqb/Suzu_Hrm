import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  CreateDepartmentSchemaInput,
  Department,
  UpdateDepartmentSchemaInput,
} from "@acme/db/schema";

import { checkPermissionOrThrow } from "../libs";
import { protectedProcedure, publicProcedure } from "../trpc";

export const departmentRouter = {
  create: protectedProcedure
    .input(CreateDepartmentSchemaInput)
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "department",
        "create",
        "Không có quyền tạo phòng ban",
      );
      const { office } = input;
      const newDepartment = await ctx.db
        .insert(Department)
        .values({ ...input, office })
        .returning();
      return newDepartment[0];
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    // await checkPermissionOrThrow(
    //   ctx,
    //   "department",
    //   "getAll",
    //   "Không có quyền xem danh sách phòng ban",
    // );
    return await ctx.db.select().from(Department).orderBy(Department.createdAt);
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "department",
        "getById",
        "Không có quyền xem phòng ban",
      );
      const { id } = input;
      const result = await ctx.db.query.Department.findFirst({
        where: (fields, { eq }) => eq(fields.id, String(id)),
      });

      return result ?? null;
    }),

  update: protectedProcedure
    .input(UpdateDepartmentSchemaInput)
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "department",
        "update",
        "Không có quyền cập nhật phòng ban",
      );
      const { id, ...rest } = input;
      const { office } = rest;
      const [updated] = await ctx.db
        .update(Department)
        .set({ ...rest, office })
        .where(eq(Department.id, String(id)))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy phiếu lương",
        });
      }

      return updated;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "department",
        "delete",
        "Không có quyền xóa phòng ban",
      );
      await ctx.db
        .delete(Department)
        .where(eq(Department.id, String(input.id)))
        .returning();
      return { success: true };
    }),
} satisfies TRPCRouterRecord;
