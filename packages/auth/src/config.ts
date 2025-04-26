import type { DBUser } from "@acme/db";
import { db } from "@acme/db/client";
import { HRMUser } from "@acme/db/schema";

import { createBrowserClient, createServerClient } from "../../supabase/src";
import { env } from "../env";

export interface Session {
  user: {
    id: string;
    email?: string;
    name?: string;
    image?: string;
  };
  expires: string;
}

export const isSecureContext = env.APP_ENV !== "development";

/** Validate Supabase JWT Token and map to HRM User */
export const validateToken = async (
  token: string,
): Promise<{ user: DBUser; expires: string } | null> => {
  const supabaseBrowser = createBrowserClient();
  try {
    // First verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabaseBrowser.auth.getUser(token);

    if (error || !user) {
      console.error("Invalid Supabase token:", error);
      return null;
    }

    // Check if user exists in HRM users table
    const hrmUser = await db
      .select()
      .from(HRMUser)
      .limit(1)
      .execute()
      .then((rows) => rows[0] ?? null);

    if (!hrmUser) {
      console.error("User not found in HRM system");
      return null;
    }

    return {
      user: hrmUser,
      expires: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  } catch (err) {
    console.error("Token validation failed:", err);
    return null;
  }
};

/** Logout/Invalidate session */
export const invalidateSessionToken = async () => {
  const supabaseBrowser = createBrowserClient();
  const { error } = await supabaseBrowser.auth.signOut();
  if (error) {
    console.error("Failed to sign out:", error);
    throw error;
  }
};

/** Get current user info from Supabase */
export const getCurrentUser = async () => {
  const supabaseServer = await createServerClient();
  try {
    const {
      data: { user },
      error,
    } = await supabaseServer.auth.getUser();

    if (error) {
      console.error("Failed to get current user:", error);
      return null;
    }

    return user;
  } catch (err) {
    console.error("Error getting current user:", err);
    return null;
  }
};

export const auth = async (): Promise<Session | null> => {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to get user:", error);
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
