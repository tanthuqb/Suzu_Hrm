import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { CreateDepartmentSchemaInput, Department } from "@acme/db/schema";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

/**
 * Department Router
 */
export const departmentRouter = createTRPCRouter({
  // Create new department
  create: protectedProcedure
    .input(CreateDepartmentSchemaInput)
    .mutation(async ({ input, ctx }) => {
      const newDepartment = await ctx.db
        .insert(Department)
        .values(input)
        .returning();
      return newDepartment[0];
    }),
  // Get all departments
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(Department).orderBy(Department.createdAt);
  }),
  // Get one department by id
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const result = await ctx.db.query.Department.findFirst({
        where: (fields, { eq }) => eq(fields.id, id),
      });

      return result ?? null;
    }),
  // Update department
  update: protectedProcedure
    .input(
      CreateDepartmentSchemaInput.extend({
        id: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      const [updated] = await ctx.db
        .update(Department)
        .set(rest)
        .where(eq(Department.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy phiếu lương",
        });
      }

      return updated;
    }),
  // Delete department
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .delete(Department)
        .where(eq(Department.id, input.id))
        .returning();
      return { success: true };
    }),
});
