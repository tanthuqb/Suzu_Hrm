import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { CreateRoleSchemaInput, Role } from "@acme/db/schema";

import { checkPermissionOrThrow } from "../libs";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const roleRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateRoleSchemaInput)
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "role",
        "create",
        "Không có quyền tạo vai trò",
      );
      const [inserted] = await ctx.db.insert(Role).values(input).returning();
      return inserted;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    await checkPermissionOrThrow(
      ctx,
      "role",
      "getAll",
      "Không có quyền xem danh sách vai trò",
    );
    return await ctx.db.select().from(Role).orderBy(desc(Role.createdAt));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "role",
        "getById",
        "Không có quyền xem vai trò",
      );
      const { id } = input;
      const result = await ctx.db
        .select()
        .from(Role)
        .where(eq(Role.id, id))
        .limit(1)
        .execute();
      if (!result.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy vai trò",
        });
      }
      return result[0];
    }),

  update: protectedProcedure
    .input(
      CreateRoleSchemaInput.extend({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "role",
        "update",
        "Không có quyền cập nhật vai trò",
      );
      const { id, ...rest } = input;
      const [updated] = await ctx.db
        .update(Role)
        .set(rest)
        .where(eq(Role.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy vai trò",
        });
      }
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "role",
        "delete",
        "Không có quyền xoá vai trò",
      );
      const deleted = await ctx.db
        .delete(Role)
        .where(eq(Role.id, input.id))
        .returning();

      if (!deleted.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy vai trò để xoá",
        });
      }

      return { message: "Xoá thành công", id: input.id };
    }),
});
