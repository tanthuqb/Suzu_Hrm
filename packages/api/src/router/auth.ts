import { createClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createServerClient } from "@acme/supabase";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        confirmPassword: z.string().min(8),
        autoConfirmEmail: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const { email, password, confirmPassword, autoConfirmEmail } = input;
      if (password !== confirmPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Passwords do not match",
        });
      }

      const supabase = await createServerClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback`,
        },
      });

      if (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }

      if (
        autoConfirmEmail &&
        data.user &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
      ) {
        const adminClient = createClient(
          process.env.PUBLIC_SUPABASE_URL || "",
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { autoRefreshToken: false, persistSession: false } },
        );
        await adminClient.auth.admin
          .updateUserById(data.user.id, { email_confirm: true })
          .catch(() => {});
      }

      const needsEmailConfirmation =
        data.user?.identities?.[0]?.identity_data?.email_verified === false &&
        !autoConfirmEmail;

      return {
        user: data.user,
        needsEmailConfirmation,
        autoConfirmed: autoConfirmEmail,
      };
    }),

  getSession: publicProcedure.query(({ ctx }) => ({ session: ctx.session })),

  getSecretMessage: protectedProcedure.query(
    () => "you can see this secret message!",
  ),

  confirmEmail: publicProcedure
    .input(
      z.object({
        token: z.string().optional(),
        userId: z.string().optional(),
        adminConfirm: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const supabase = await createServerClient();

      if (input.token && !input.adminConfirm) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: input.token,
          type: "signup",
        });
        if (error)
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        return { success: true };
      }

      if (
        input.userId &&
        input.adminConfirm &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
      ) {
        const admin = createClient(
          process.env.PUBLIC_SUPABASE_URL || "",
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { autoRefreshToken: false, persistSession: false } },
        );
        const { error } = await admin.auth.admin.updateUserById(input.userId, {
          email_confirm: true,
        });
        if (error)
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        return { success: true, adminConfirmed: true };
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid confirmation request.",
      });
    }),

  resetPassword: publicProcedure
    .input(z.object({ password: z.string().min(8) }))
    .mutation(async ({ input }) => {
      const supabase = await createServerClient();
      const { error } = await supabase.auth.updateUser({
        password: input.password,
      });
      if (error)
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      return { success: true };
    }),

  updatePassword: protectedProcedure
    .input(
      z.object({ currentPassword: z.string(), newPassword: z.string().min(8) }),
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = await createServerClient();
      const { error } = await supabase.auth.updateUser({
        password: input.newPassword,
      });
      if (error)
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      return { success: true };
    }),

  signOut: protectedProcedure.mutation(async () => {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signOut();
    if (error)
      throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
    return { success: true };
  }),
});
