import { cache } from "react";
import { redirect } from "next/navigation";

import type { Session } from "./config";
import { createServerClient } from "../../supabase/src";
import { env } from "../env";
import {
  invalidateSessionToken,
  isSecureContext,
  validateToken,
} from "./config";

const supabase = await createServerClient();

export const handleSignInWithGoogle = async () => {
  const { PUBLIC_APP_URL } = env;
  console.log("aaa", `${PUBLIC_APP_URL}/api/auth/callback`);
  console.log("PUBLIC_APP_URL", PUBLIC_APP_URL);
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

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const auth = cache(async (): Promise<Session | null> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    return null;
  }

  const { data: userData, error } = await supabase.auth.getUser();

  if (error || !userData.user) {
    return null;
  }

  return {
    user: {
      id: userData.user.id,
      email: userData.user.email ?? undefined,
      name: userData.user.user_metadata.full_name,
      image: userData.user.user_metadata.avatar_url,
    },
    expires:
      session.expires_at?.toString() ??
      new Date(Date.now() + 3600 * 1000).toISOString(),
  };
});

export { validateToken, invalidateSessionToken, isSecureContext };
