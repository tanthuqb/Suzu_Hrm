import { redirect } from "next/navigation";

import type { HRMUserRow } from "./config";
import { createBrowserClient } from "../../supabase/src";
import { env } from "../env";
import {
  invalidateSessionToken,
  isSecureContext,
  validateToken,
} from "./config";

const supabase = await createBrowserClient();

export type User = HRMUserRow;

export interface Session {
  user: User;
  expires: string;
}

export const handleSignInWithGoogle = async () => {
  const { PUBLIC_APP_URL } = env;
  console.log("aaa", `${PUBLIC_APP_URL}/api/auth/callback`);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${PUBLIC_APP_URL}/auth/callback`,
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
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/** Supabase Sign Out */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const auth = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to get user:", error);
    return null;
  }

  if (!data.user) {
    console.error("No user found in the session");
    return null;
  }

  // Get HRM user data using validateToken
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    return null;
  }

  const hrmUser = await validateToken(token);
  if (!hrmUser) {
    return null;
  }

  return {
    user: hrmUser.user,
    expires: hrmUser.expires,
  };
};

export { validateToken, invalidateSessionToken, isSecureContext };
