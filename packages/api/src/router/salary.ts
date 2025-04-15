import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { CreateSalarySlipSchema, SalarySlip } from "@acme/db/schema";
import { isUUID } from "@acme/validators";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const salaryRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateSalarySlipSchema)
    .mutation(async ({ input }) => {
      const [inserted] = await db.insert(SalarySlip).values(input).returning();
      return inserted;
    }),

  getAll: protectedProcedure.query(async () => {
    return await db.select().from(SalarySlip).orderBy(SalarySlip.createdAt);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      if (!isUUID(input.id)) {
        return null;
      }

      const result = await db.query.SalarySlip.findFirst({
        where: eq(SalarySlip.id, input.id!),
      });

      return result ?? null;
    }),

  getByUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input }) => {
      return await db
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
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const [updated] = await db
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
    .mutation(async ({ input }) => {
      const deleted = await db
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
