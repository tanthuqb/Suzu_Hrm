import type { TRPCRouterRecord } from "@trpc/server";
import { createClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createServerClient } from "@acme/supabase";

import { protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = {
  // Register a new user
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        confirmPassword: z.string().min(8),
        autoConfirmEmail: z.boolean().optional().default(false), // Add flag to auto-confirm email
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

      try {
        // For normal signups with email verification
        const signUpOptions = {
          email,
          password,
          options: {
            emailRedirectTo: `${process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback`,
          },
        };

        // When autoConfirmEmail is true, disable email verification for testing or admin-created accounts
        if (autoConfirmEmail) {
          // In Supabase, the actual confirmation happens server-side through admin APIs
          // Since we can't directly auto-confirm through the client SDK, we'll just do the standard signup
          // then make a note that we need to handle the confirmation separately through admin API
          console.log("Auto-confirm email requested for:", email);
        }

        // Perform the signup
        const { data, error } = await supabase.auth.signUp(signUpOptions);

        if (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }

        // If auto-confirm is enabled, we need to confirm the email through admin API
        // This requires the Supabase service role key and should be done with caution
        if (
          autoConfirmEmail &&
          data.user &&
          process.env.SUPABASE_SERVICE_ROLE_KEY
        ) {
          // Create admin client with service role for privileged operations
          const adminAuthClient = createClient(
            process.env.PUBLIC_SUPABASE_URL || "",
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false,
              },
            },
          );

          // Use admin API to update user (mark email as confirmed)
          if (data.user.id) {
            try {
              await adminAuthClient.auth.admin.updateUserById(data.user.id, {
                email_confirm: true,
              });
              console.log("Email auto-confirmed for user:", data.user.id);
            } catch (adminError: any) {
              console.error("Failed to auto-confirm email:", adminError);
              // We don't throw here because the signup was still successful
            }
          }
        }

        // Check if confirmEmail is needed - if we auto-confirmed, this will still be false,
        // but we'll override it in the response
        const isEmailConfirmationNeeded =
          data?.user?.identities?.[0]?.identity_data?.email_verified ===
            false && !autoConfirmEmail;

        return {
          user: data.user,
          needsEmailConfirmation: isEmailConfirmationNeeded,
          autoConfirmed: autoConfirmEmail,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to register user",
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
    .input(
      z.object({
        token: z.string().optional(),
        userId: z.string().optional(),
        adminConfirm: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const supabase = await createServerClient();

      try {
        // Option 1: Regular user confirming via token from email
        if (input.token && !input.adminConfirm) {
          // Verify the email confirmation token
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const { error } = await supabase.auth.verifyOtp({
            token_hash: input.token,
            type: "signup",
          });

          if (error) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: error.message,
            });
          }

          return { success: true };
        }
        // Option 2: Admin confirmation of a user's email
        else if (
          input.userId &&
          input.adminConfirm &&
          process.env.SUPABASE_SERVICE_ROLE_KEY
        ) {
          // Create admin client with service role for privileged operations
          const adminAuthClient = createClient(
            process.env.PUBLIC_SUPABASE_URL || "",
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false,
              },
            },
          );

          // Use admin API to confirm email for the user
          const { error } = await adminAuthClient.auth.admin.updateUserById(
            input.userId,
            { email_confirm: true },
          );

          if (error) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: error.message,
            });
          }

          return { success: true, adminConfirmed: true };
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Invalid confirmation request. Provide either token or userId with adminConfirm flag.",
          });
        }
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
