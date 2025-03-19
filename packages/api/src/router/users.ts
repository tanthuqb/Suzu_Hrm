import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@acme/db";
import { HRMUser } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

// Support both string ID directly and object with ID property
const idSchema = z.union([
  z.string(),
  z.object({ id: z.string() })
]);

export const userRouter: TRPCRouterRecord = {
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        supabaseUserId: z.string(),
        role: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(HRMUser).values(input);
    }),
  all: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.HRMUser.findMany();
  }),
  byId: protectedProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const id = typeof input === 'string' ? input : input.id;
      return ctx.db.query.HRMUser.findFirst({
        where: eq(HRMUser.id, id),
      });
    }),
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const id = typeof input === 'string' ? input : input.id;
      return ctx.db.delete(HRMUser).where(eq(HRMUser.id, id));
    }),
};
