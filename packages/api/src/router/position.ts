import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  CreatePositionSchemaInput,
  Department,
  Position,
  UpdatePositionSchemaInput,
} from "@acme/db/schema";

import { checkPermissionOrThrow } from "../libs";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const positionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreatePositionSchemaInput)
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "position",
        "create",
        "Không có quyền tạo vị trí công việc",
      );

      const newPosition = await ctx.db
        .insert(Position)
        .values({ ...input })
        .returning();
      return newPosition[0];
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    // await checkPermissionOrThrow(
    //   ctx,
    //   "position",
    //   "getAll",
    //   "Không có quyền xem danh sách vị trí công việc",
    // );
    return await ctx.db
      .select({
        id: Position.id,
        name: Position.name,
        departmentId: Position.departmentId,
        createdAt: Position.createdAt,
        updatedAt: Position.updatedAt,
        department: {
          id: Department.id,
          name: Department.name,
        },
      })
      .from(Position)
      .leftJoin(Department, eq(Position.departmentId, Department.id))
      .orderBy(Position.createdAt);
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "position",
        "getById",
        "Không có quyền xem vị trí công việc",
      );
      const { id } = input;
      const result = await ctx.db
        .select()
        .from(Position)
        .where(eq(Position.id, String(id)))
        .limit(1);
      return result[0];
    }),

  update: protectedProcedure
    .input(UpdatePositionSchemaInput)
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "position",
        "update",
        "Không có quyền cập nhật vị trí công việc",
      );
      const { id, ...rest } = input;
      const [updated] = await ctx.db
        .update(Position)
        .set({ ...rest })
        .where(eq(Position.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy vị trí công việc",
        });
      }

      return updated;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "position",
        "delete",
        "Không có quyền xóa phòng ban",
      );
      await ctx.db
        .delete(Position)
        .where(eq(Position.id, input.id))
        .returning();
      return { success: true };
    }),
});
