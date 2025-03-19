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
    console.log("Redirecting to auth URL:", data.url);
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

  // Log the session details to help debugging
  console.log("Session established:", {
    userId: sessionData.session?.user.id,
    email: sessionData.session?.user.email,
    hasSession: !!sessionData.session,
  });

  return data;
}

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
  const { data, error } = await supabase.auth.signUp({
    email,
    password: password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
};
