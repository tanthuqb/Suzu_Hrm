"use server";

import { redirect } from "next/navigation";

import { createServerClient } from "@acme/supabase";

export const handleSignInWithGoogle = async () => {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.PUBLIC_APP_CLIENT_URL}/api/auth/callback`,
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

/** Supabase Sign In (Email & Password hoặc OAuth) */
export async function signInEmail(email: string, password: string) {
  const supabase = await createServerClient();

  // Sign in with password
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign in error:", error);
    throw new Error(error.message);
  }

  // Ensure that session is refreshed and cookies are set properly
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    console.error("Session retrieval error:", sessionError);
    throw new Error(sessionError.message);
  }

  return data;
}

export const checkAuth = async () => {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
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
) => {
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const supabase = await createServerClient();
  
  // Enable email confirmation by including the email redirect option
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`,
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  // Check if email confirmation is needed
  const isEmailConfirmationNeeded = data?.user?.identities?.[0]?.identity_data?.email_verified === false;

  return {
    user: data.user,
    needsEmailConfirmation: isEmailConfirmationNeeded
  };
};

/**
 * Send password reset email to the user
 */
// Import the API client to use tRPC
import { trpc } from "~/trpc/react";

export const forgotPassword = async (email: string) => {
  try {
    // Note: This will be replaced by the tRPC implementation
    // In a real application, you would use the tRPC client, but since this is 
    // a server action, we're still using the direct Supabase client
    const supabase = await createServerClient();
    
    // Determine redirect URL based on environment
    const isLocalDev = process.env.APP_ENV === "development";
    const baseUrl = isLocalDev
      ? "http://localhost:3000"
      : process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL;

    const redirectUrl = `${baseUrl}/(user)/reset-password`;

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
    throw new Error(error.message || "Failed to send password reset email");
  }
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
