import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createServerClient } from "@acme/supabase";

import { protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = {
  // Register a new user
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      confirmPassword: z.string().min(8)
    }))
    .mutation(async ({ input }) => {
      const { email, password, confirmPassword } = input;
      
      if (password !== confirmPassword) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Passwords do not match',
        });
      }
      
      const supabase = await createServerClient();
      
      try {
        // Enable email confirmation by default
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`,
          }
        });

        if (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }

        // Check if confirmEmail is needed
        const isEmailConfirmationNeeded = data?.user?.identities?.[0]?.identity_data?.email_verified === false;
        
        return { 
          user: data.user, 
          needsEmailConfirmation: isEmailConfirmationNeeded 
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to register user',
        });
      }
    }),
  getSession: publicProcedure.query(async ({ ctx }) => {
    return { session: ctx.session };
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),

  // Confirm email with confirmation token
  confirmEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const supabase = await createServerClient();

      try {
        // Verify the email confirmation token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: input.token,
          type: "email_confirmation",
        });

        if (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }

        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to confirm email",
        });
      }
    }),

  // Request password reset
  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const supabase = await createServerClient();

      try {
        // Determine redirect URL based on environment
        const isLocalDev = process.env.APP_ENV === "development";
        const baseUrl = isLocalDev
          ? "http://localhost:3000"
          : process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL;

        const redirectUrl = `${baseUrl}/(user)/reset-password`;

        const { error } = await supabase.auth.resetPasswordForEmail(
          input.email,
          {
            redirectTo: redirectUrl,
          },
        );

        if (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }

        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to send password reset email",
        });
      }
    }),

  // Reset password with token
  resetPassword: publicProcedure
    .input(
      z.object({
        password: z.string().min(8),
        token: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const supabase = await createServerClient();

      try {
        // Update the user's password
        const { error } = await supabase.auth.updateUser({
          password: input.password,
        });

        if (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }

        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to reset password",
        });
      }
    }),

  // Update user's password (when logged in)
  updatePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update your password",
        });
      }

      const supabase = await createServerClient();

      try {
        // We don't have a direct way to verify current password with Supabase,
        // but we can implement this check if needed

        // Update the user's password
        const { error } = await supabase.auth.updateUser({
          password: input.newPassword,
        });

        if (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }

        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to update password",
        });
      }
    }),

  // Sign out the user
  signOut: protectedProcedure.mutation(async () => {
    const supabase = await createServerClient();

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      return { success: true };
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Failed to sign out",
      });
    }
  }),
} satisfies TRPCRouterRecord;
