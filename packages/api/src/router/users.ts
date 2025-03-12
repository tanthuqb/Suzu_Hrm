import type { TRPCRouterRecord } from "@trpc/server";

import { protectedProcedure } from "../trpc";

export const userRouter: TRPCRouterRecord = {
  getUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session?.user;
  }),
};
