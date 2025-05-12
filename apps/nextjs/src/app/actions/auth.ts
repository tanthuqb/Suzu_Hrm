"use server";

import { redirect } from "next/navigation";

import type { AuthUser } from "@acme/db";
import { createServerClient } from "@acme/supabase";

import { isValidEmail } from "~/app/libs/index";
import { env } from "~/env";

/**
 * Sign in the user with Google
 * @returns {Promise<any>} - Returns user data
 */

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
  // Only redirect if we have a URL
  if (data.url) {
    redirect(data.url);
  }

  return data;
};

/**
 * Sign in the user with email and password
 * @param email - The email address of the user
 * @param password - The password for the user
 * @returns {Promise<any>} - Returns user data
 */
export async function signInEmail(email: string, password: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (
      error.message.includes("Email not confirmed") &&
      env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      try {
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
        const userRec = userData.users.find(
          (user) => user.user_metadata.email === email,
        );
        if (userRec?.id) {
          await adminAuthClient.auth.admin.updateUserById(userRec.id, {
            email_confirm: true,
          });
          // retry sign in
          const { data: retryData, error: retryErr } =
            await supabase.auth.signInWithPassword({ email, password });
          if (retryErr) throw retryErr;
          return retryData;
        }
      } catch (e) {
        console.error("Auto-confirm failed:", e);
      }
    }
    console.error("Sign in error:", error);
    throw new Error(error.message);
  }

  // Verify user via Auth server
  const {
    data: { user: verifiedUser },
    error: verifyError,
  } = await supabase.auth.getUser();
  if (verifyError || !verifiedUser) {
    console.error("User verification failed:", verifyError);
    throw new Error("Failed to verify user session.");
  }

  return data;
}
/**
 * Check if the user is authenticated
 * @returns {Promise<{ status: boolean; message?: string; user?: AuthUser }>} - Returns authentication status and user data
 */

export const checkAuth = async (): Promise<{
  status: boolean;
  message?: string;
  user?: AuthUser;
}> => {
  const supabase = await createServerClient();
  const { data: authUser, error: authError } = await supabase.auth.getUser();

  if (authError) {
    return {
      status: false,
      message: "Bạn cần đăng nhập hoặc phiên đã hết hạn.",
    };
  }

  if (!isValidEmail(authUser.user.email!)) {
    return { status: false, message: "Email không phải của tổ chức." };
  }

  const { data: rows, error: dbError } = await supabase
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
        permissions ( id, action )
      )
    `,
    )
    .eq("email", authUser.user.email)
    .maybeSingle();

  if (dbError || !rows) {
    return {
      status: false,
      message: "Không tìm thấy tài khoản trong hệ thống.",
    };
  }

  if (rows.status !== "active") {
    return {
      status: false,
      message: "Tài khoản bị khóa hoặc không hoạt động.",
    };
  }

  const role =
    Array.isArray(rows.role) && rows.role.length > 0
      ? rows.role[0]
      : (rows.role as any);

  if (!role) {
    return {
      status: false,
      message: "Bạn không có quyền truy cập.",
    };
  }

  const user = {
    id: rows.id,
    email: rows.email,
    firstName: rows.firstName,
    lastName: rows.lastName,
    status: rows.status,
    role_id: rows.role_id,
    role: role.name,
    permissions: role.permissions.map((permission: any) => ({
      action: permission.action,
      id: permission.id,
    })),
  };

  return { status: true, user };
};

/**
 * Sign out the user
 * @returns {Promise<void>} - Returns nothing
 */
export const signOut = async () => {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Register a new user
 * @param email - The email address of the user
 * @param password - The password for the user
 * @param confirmPassword - The confirmation password
 * @param autoConfirmEmail - Flag to auto-confirm email (default: true)
 * @returns {Promise<any>} - Returns user data and confirmation status
 */
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
 * @param password - The new password
 * @param confirmPassword - The confirmation password
 * @returns {Promise<any>} - Returns success message
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

/**
 * Send password reset email to the user
 * @param email - The email address of the user
 * @returns {Promise<any>} - Returns success message
 */
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
    throw new Error(error?.message ?? "Failed to send password reset email");
  }
};

/**
 * Update user's email (when logged in)
 * @param email - The new email address
 * @returns {Promise<any>} - Returns success message
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
 * Reset password using the recovery token
 * @param password - The new password
 * @param confirmPassword - The confirmation password
 * @returns {Promise<any>} - Returns success message
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
 * Refresh token
 * @returns {Promise<any>} - Returns the refreshed session data
 */
export const refreshToken = async () => {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    console.error("Token refresh error:", error);
    throw new Error(error.message);
  }

  return data;
};
/**
 * Verify Recovery Token
 * @param code - The recovery token code
 * @returns {Promise<boolean>} - Returns true if the token is valid
 */

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
 * Check if the email exists in the database
 * @param email - The email address to check
 * @returns {Promise<any>} - Returns the user data if found
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
 * Update the user's status
 * @param email - The email address of the user
 * @param newStatus - The new status to set
 * @returns {Promise<any>} - Returns success message
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
