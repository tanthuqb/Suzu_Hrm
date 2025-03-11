import { cache } from "react";
import { redirect } from "next/navigation";

import type { Session } from "./config";
import { supabaseClient } from "../../supabase/src";
import {
  invalidateSessionToken,
  isSecureContext,
  validateToken,
} from "./config";

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

export const signOut = async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const auth = cache(async (): Promise<Session | null> => {
  const { data: sessionData } = await supabaseClient.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    return null;
  }

  const { data: userData, error } = await supabaseClient.auth.getUser();

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
