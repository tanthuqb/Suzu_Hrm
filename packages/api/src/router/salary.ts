import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { CreateSalarySlipSchema, SalarySlip } from "@acme/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const salaryRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateSalarySlipSchema)
    .mutation(async ({ input, ctx }) => {
      const [inserted] = await ctx.db
        .insert(SalarySlip)
        .values(input)
        .returning();
      return inserted;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(SalarySlip).orderBy(SalarySlip.createdAt);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const result = await ctx.db.query.SalarySlip.findFirst({
        where: (fields, { eq }) => eq(fields.id, id),
      });

      return result ?? null;
    }),

  getByUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db
        .select()
        .from(SalarySlip)
        .where(eq(SalarySlip.userId, input.userId));
    }),

  update: protectedProcedure
    .input(
      CreateSalarySlipSchema.extend({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      const [updated] = await ctx.db
        .update(SalarySlip)
        .set(rest)
        .where(eq(SalarySlip.id, id))
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
        .delete(SalarySlip)
        .where(eq(SalarySlip.id, input.id))
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
