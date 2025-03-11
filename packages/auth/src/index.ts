import { redirect } from "next/navigation";

import type { HRMUserRow } from "./config";
import { supabaseClient } from "../../supabase/src";
import {
  invalidateSessionToken,
  isSecureContext,
  validateToken,
} from "./config";

export type User = HRMUserRow;

export interface Session {
  user: User;
  expires: string;
}

export const handleSignInWithGoogle = async () => {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://mempvqxtouxcmxqiilln.supabase.co/auth/v1/callback",
    },
  });

  if (error) {
    console.error("Failed to sign in with Google:", error);
    throw new Error(error.message);
  }

  if (data.url) {
    redirect(data.url);
  }

  return data;
};

/** Supabase Sign In (Email & Password hoặc OAuth) */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
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
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const auth = async (): Promise<Session | null> => {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error) {
    console.error("Failed to get user:", error);
    return null;
  }

  if (!data.user) {
    console.error("No user found in the session");
    return null;
  }

  // Get HRM user data using validateToken
  const token = await supabaseClient.auth
    .getSession()
    .then((res) => res.data.session?.access_token);
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
