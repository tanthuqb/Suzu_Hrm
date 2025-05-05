"use server";

import { redirect } from "next/navigation";

import type { AuthUser, SupabaseUserRow } from "@acme/db";
import { createServerClient } from "@acme/supabase";

import { isValidEmail } from "~/app/libs/index";
import { env } from "~/env";

/**
 * Send password reset email to the user
 */
// Import the API client to use tRPC

export const handleSignInWithGoogle = async () => {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      skipBrowserRedirect: false, // Ensure browser handles the redirect
    },
  });
  if (error) {
    console.error("Failed to sign in with Google:", error);
    throw new Error(error.message);
  }
  console.log(3333, `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback`);
  // Only redirect if we have a URL
  if (data.url) {
    redirect(data.url);
  }

  return data;
};

/** Supabase Sign In (Email & Password hoặc OAuth) */
export async function signInEmail(email: string, password: string) {
  const supabase = await createServerClient();
  // Sign in with password
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // If error is "Email not confirmed", try to auto-confirm it
    if (
      error.message.includes("Email not confirmed") &&
      env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      try {
        // Get user by email to get the user ID
        // Create admin client with service role for privileged operations
        const { createClient } = await import("@supabase/supabase-js");
        const adminAuthClient = createClient(
          env.PUBLIC_SUPABASE_URL || "",
          env.SUPABASE_SERVICE_ROLE_KEY,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          },
        );

        // Get user by email to find their ID
        const { data: userData } = await adminAuthClient.auth.admin.listUsers();
        const user = userData.users.find((u) => u.email === email);

        if (user?.id) {
          // Use admin API to update user (mark email as confirmed)
          await adminAuthClient.auth.admin.updateUserById(user.id, {
            email_confirm: true,
          });
          console.log("Email auto-confirmed for user:", user.id);

          // Try signin again after confirmation
          const { data: confirmedData, error: confirmedError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (confirmedError) {
            console.error(
              "Sign in error after email confirmation:",
              confirmedError,
            );
            throw new Error(confirmedError.message);
          }

          // Refresh session
          const { error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error("Session retrieval error:", sessionError);
            throw new Error(sessionError.message);
          }

          return confirmedData;
        }
      } catch (adminError) {
        console.error("Failed to auto-confirm email during login:", adminError);
        // Continue with original error
      }
    }

    console.error("Sign in error:", error);
    throw new Error(error.message);
  }

  // Ensure that session is refreshed and cookies are set properly
  const { error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Session retrieval error:", sessionError);
    throw new Error(sessionError.message);
  }

  return data;
}

export const checkAuth = async (): Promise<AuthUser | null> => {
  const supabase = await createServerClient();
  const { data: authUser, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser.user.email) return null;

  const { data: users, error: userError } = await supabase
    .from("users")
    .select(
      `
      id,
      firstName,
      lastName,
      email,
      status,
      role_id,
      role:roles (
        id,
        name,
        permissions:permissions (
          id,
          action
        )
      )
    `,
    )
    .eq("email", authUser.user.email);
  if (userError || !users.length) return null;

  const rawUser = users[0] as SupabaseUserRow;
  console.log("rawUser.status", rawUser.status != "active");

  if (rawUser.status != "active") {
    return null;
  }
  const role = Array.isArray(rawUser.role) ? rawUser.role[0] : rawUser.role;
  if (!role) return null;

  const userData: AuthUser = {
    id: rawUser.id,
    email: rawUser.email,
    firstName: rawUser.firstName,
    lastName: rawUser.lastName,
    role_id: rawUser.role_id,
    role: {
      id: role.id,
      name: role.name,
      permissions:
        role.permissions?.map((p) => ({
          id: p.id,
          action: p.action,
        })) ?? [],
    },
  };

  return userData;
};

/** Supabase Sign Out */
export const signOut = async () => {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const registerUser = async (
  email: string,
  password: string,
  confirmPassword: string,
  autoConfirmEmail = true, // Add flag to auto-confirm email
) => {
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  // For now we'll keep the direct Supabase implementation:
  const supabase = await createServerClient();

  // Enable email confirmation by including the email redirect option
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL || env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  // Check if email confirmation is needed
  const isEmailConfirmationNeeded =
    data.user?.identities?.[0]?.identity_data?.email_verified === false;

  // Implement auto-confirmation when requested
  if (autoConfirmEmail && data.user?.id && env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      // Create admin client with service role for privileged operations
      const { createClient } = await import("@supabase/supabase-js");
      const adminAuthClient = createClient(
        env.PUBLIC_SUPABASE_ANON_KEY || "",
        env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );

      // Use admin API to update user (mark email as confirmed)
      await adminAuthClient.auth.admin.updateUserById(data.user.id, {
        email_confirm: true,
      });
      console.log("Email auto-confirmed for user:", data.user.id);
    } catch (adminError) {
      console.error("Failed to auto-confirm email:", adminError);
      // We don't throw here because the signup was still successful
    }
  }

  return {
    user: data.user,
    needsEmailConfirmation: isEmailConfirmationNeeded && !autoConfirmEmail,
    autoConfirmed: autoConfirmEmail,
  };
};

/**
 * Update user's password (when logged in)
 */
export const updatePassword = async (
  password: string,
  confirmPassword: string,
) => {
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const supabase = await createServerClient();

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error("Password update error:", error);
    throw new Error(error.message);
  }

  return { success: true };
};

export const forgotPassword = async (email: string) => {
  try {
    const supabase = await createServerClient();
    const isLocalDev = env.APP_ENV === "development";
    const baseUrl = isLocalDev
      ? "http://localhost:3000"
      : env.NEXT_PUBLIC_APP_URL || env.NEXT_PUBLIC_APP_URL;

    const redirectUrl = `${baseUrl}/callback?next=/reset-password&type=recovery`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error("Password reset error:", error);
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Password reset error:", error);
    throw new Error(error?.message || "Failed to send password reset email");
  }
};

/**
 * Update user's email (when logged in)
 */
export const updateEmail = async (email: string) => {
  const supabase = await createServerClient();

  const { error } = await supabase.auth.updateUser({
    email: email,
  });

  if (error) {
    console.error("Email update error:", error);
    throw new Error(error.message);
  }

  return {
    success: true,
    message: "Verification email sent. Please check your inbox.",
  };
};

/**
 * Reset password with token (from reset password email)
 */
export const resetPassword = async (
  password: string,
  confirmPassword: string,
) => {
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const supabase = await createServerClient();

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error("Password reset error:", error);
    throw new Error(error.message);
  }

  return { success: true };
};

/**
 * Refresh Token Expires
 */
export const refreshSessionServer = async () => {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error("Error refreshing session:", error);
  }
};

export const verifyRecoveryToken = async (code: string) => {
  const url = `${env.PUBLIC_SUPABASE_ANON_KEY}/auth/v1/token`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.PUBLIC_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      grant_type: "recovery",
      code,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("🛑 Recovery token exchange failed:", data);
    throw new Error(data.error_description || "Recovery failed");
  }

  const supabase = await createServerClient();

  await supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });

  return true;
};

/**
 * check email in databaes (when logged in)
 */
const checkEmail = async (email: string) => {
  if (!isValidEmail(email)) {
    console.log("Email adress not valid");
    throw new Error("Email adress not valid");
  }
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();
  if (error) {
    throw new Error("Có lỗi xảy ra " + error.message);
  }
  return data;
};

/**
 * Update user's status (when logged in)
 */
export const updateStatus = async (email: string, newStatus: string) => {
  const supabase = await createServerClient();

  const user = await checkEmail(email);
  const { error } = await supabase
    .from("users")
    .update({ status: newStatus })
    .eq("id", user.id);

  if (error) {
    console.error("Status update error:", error);
    throw new Error(error.message);
  }

  return { success: true };
};
