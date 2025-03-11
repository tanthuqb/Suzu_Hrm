import { redirect } from "next/navigation";

import { supabase } from "../../supabase/index";
import {
  invalidateSessionToken,
  isSecureContext,
  validateToken,
} from "./config";

export interface User {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  role: string;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  expires: string;
}

export const handleSignInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://mempvqxtouxcmxqiilln.supabase.co/auth/v1/callback",
    },
  });

  if (error) {
    console.error("Failed to sign in with Google:", error);
    throw new Error(error.message);
  }
  console.log("data", data);
  if (data.url) {
    redirect(data.url); // Use the redirect API for your server framework
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

export const auth = async (token?: string): Promise<Session | null> => {
  try {
    if (token) {
      supabase.auth.setAuth(token);
    }

    const { data, error } = await supabase.auth.getUser();
    console.log("User data:", data);

    if (error) {
      console.error("Failed to get user:", error);
      return null;
    }

    if (!data?.user) {
      console.error("No user found in the session");
      return null;
    }

    return {
      user: data.user as unknown as User,
      expires: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return null;
  }
};

export { validateToken, invalidateSessionToken, isSecureContext };
