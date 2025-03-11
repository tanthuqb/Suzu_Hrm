import { cache } from "react";
import { redirect } from "next/navigation";

import { supabase } from "../../supabase/index";
import {
  invalidateSessionToken,
  isSecureContext,
  validateToken,
} from "./config";

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

/**
 * Supabase Sign In (Email & Password hoặc OAuth)
 */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log("data", data);
  console.log("error", error);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Supabase Sign Out (Logout)
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  console.log("error", error);
  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Supabase Auth - Lấy thông tin user hiện tại (giống NextAuth `auth()`)
 * Có cache lại để tránh gọi nhiều lần trên RSC
 */
export const auth = cache(async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to get user:", error);
    return;
  }

  if (!data.user) {
    console.error("No user found in the session");
    return;
  }

  return data.user;
});
/**
 * Type Session giữ lại để không lỗi các chỗ dùng `Session`
 */
export interface Session {
  user: {
    id: string;
    email?: string;
    name?: string;
    image?: string;
  };
  expires: string;
}

/**
 * Không còn dùng handlers vì NextAuth không còn
 */
export { validateToken, invalidateSessionToken, isSecureContext };
