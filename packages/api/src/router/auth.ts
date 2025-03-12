import type { TRPCRouterRecord } from "@trpc/server";

import { protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = {
  getSession: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    // const { data, error } = await db.auth.getSession();

    // if (error) {
    //   return { session: null, error: error.message };
    // }

    // return { session: data.session, user: data.session?.user ?? null };
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),

  // Protected: Sign out the user
  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    console.log("getSession", ctx);
    const { db } = ctx;
    console.log("db", db);
    // const { error } = await db.auth.signOut();

    // if (error) {
    //   return { success: false, error: error.message };
    // }

    // return { success: true };
  }),
} satisfies TRPCRouterRecord;
