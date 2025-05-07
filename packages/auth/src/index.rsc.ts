import { cache } from "react";
import { redirect } from "next/navigation";

import type { FullHrmUser } from "@acme/db";
import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { Department, HRMUser, Permission, Role } from "@acme/db/schema";

import type { Session } from "./config";
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

export const auth = cache(async (): Promise<Session | null> => {
  try {
    const supabase = await createServerClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      console.error("User not authenticated");
      return null;
    }

    const hrmUser = await validateToken(token);

    if (!hrmUser) {
      console.error("Invalid token");
      return null;
    }

    const userData = await db
      .select({
        id: HRMUser.id,
        employeeCode: HRMUser.employeeCode,
        name: HRMUser.name,
        firstName: HRMUser.firstName,
        lastName: HRMUser.lastName,
        email: HRMUser.email,
        roleId: HRMUser.roleId,
        departmentId: HRMUser.departmentId,
        phone: HRMUser.phone,
        status: HRMUser.status,
        createdAt: HRMUser.createdAt,
        updatedAt: HRMUser.updatedAt,
        roleName: Role.name,
      })
      .from(HRMUser)
      .leftJoin(Role, eq(HRMUser.roleId, Role.id))
      .leftJoin(Permission, eq(Role.id, Permission.roleId))
      .where(eq(HRMUser.email, hrmUser.user.email));

    if (userData.length === 0) {
      console.error("User not found in database.");
      return null;
    }

    const role = userData[0]?.roleName ?? "guest";

    return {
      user: userData[0] as Omit<FullHrmUser, "departmentId" | "roleId">,
      expires: hrmUser.expires,
      role,
    };
  } catch (error) {
    console.error("Error during authentication:", error);
    return null;
  }
});

export { validateToken, invalidateSessionToken, isSecureContext };
