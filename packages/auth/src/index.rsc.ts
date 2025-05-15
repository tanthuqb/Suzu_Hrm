import { cache } from "react";
import { redirect } from "next/navigation";

import type { FullHrmUser } from "@acme/db";
import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { HRMUser, Permission, Role } from "@acme/db/schema";

import type { FullSession } from "./config";
import { createServerClient } from "../../supabase/src";
import { env } from "../env";
import {
  invalidateSessionToken,
  isSecureContext,
  validateToken,
} from "./config";

export const handleSignInWithGoogle = async () => {
  const supabase = await createServerClient();
  const { NEXT_PUBLIC_APP_URL } = env;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${NEXT_PUBLIC_APP_URL}/api/auth/callback`,
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
  const supabase = await createServerClient();
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
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const auth = cache(async (): Promise<FullSession | null> => {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) return null;

    const token = session.access_token;
    if (!token) return null;

    const validated = await validateToken(token);
    if (!validated) return null;
    console.log("Session query2:", validated, token);
    const rows = await db
      .select({
        id: HRMUser.id,
        employeeCode: HRMUser.employeeCode,
        name: HRMUser.name,
        firstName: HRMUser.firstName,
        lastName: HRMUser.lastName,
        email: HRMUser.email,
        roleId: HRMUser.roleId,
        phone: HRMUser.phone,
        status: HRMUser.status,
        createdAt: HRMUser.createdAt,
        updatedAt: HRMUser.updatedAt,
        roleName: Role.name,
      })
      .from(HRMUser)
      .leftJoin(Role, eq(HRMUser.roleId, Role.id))
      .where(eq(HRMUser.email, validated.user.email));

    if (rows.length === 0) return null;

    const row = rows[0]!;

    const roleName = row.roleName ?? "guest";
    const { roleName: __, ...hrmRest } = row;

    const full: FullSession = {
      authUser: {
        id: validated.user.id,
        email: validated.user.email,
        app_metadata: validated.user_metadata,
      },
      hrmUser: {
        ...hrmRest,
        roleName,
      },
      expires: session.expires_at
        ? new Date(session.expires_at).toISOString()
        : "",
    };

    return full;
  } catch (error) {
    console.error("Error during authentication:", error);
    return null;
  }
});

export { validateToken, invalidateSessionToken, isSecureContext };
