import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@acme/db";
import { HRMUser } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

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
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.HRMUser.findFirst({
        where: eq(HRMUser.id, input.id),
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(HRMUser).where(eq(HRMUser.id, input.id));
    }),
};
