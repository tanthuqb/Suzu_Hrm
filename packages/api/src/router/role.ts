import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { CreateRoleSchemaInput, Role } from "@acme/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const roleRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateRoleSchemaInput)
    .mutation(async ({ input, ctx }) => {
      const [inserted] = await ctx.db.insert(Role).values(input).returning();
      return inserted;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(Role).orderBy(Role.createdAt);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
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
      const { id, ...rest } = input;
      const [updated] = await ctx.db
        .update(Role)
        .set(rest)
        .where(eq(Role.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy phiếu lương",
        });
      }
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const deleted = await ctx.db
        .delete(Role)
        .where(eq(Role.id, input.id))
        .returning();

      if (!deleted.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy phiếu lương để xoá",
        });
      }

      return { message: "Xoá thành công", id: input.id };
    }),
});
