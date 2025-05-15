import { eq } from "drizzle-orm";

import type { FullHrmUser } from "@acme/db";
import { db } from "@acme/db/client";
import { HRMUser, Role } from "@acme/db/schema";

import { createBrowserClient, createServerClient } from "../../supabase/src";
import { env } from "../env";

export interface FullSession {
  authUser: {
    id: string;
    email: string;
    app_metadata: Record<string, any>;
  };
  hrmUser: {
    id: string;
    employeeCode: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    roleId: string;
    phone: string | null;
    status: string | null;
    createdAt: Date;
    updatedAt: Date;
    roleName: string;
  };
  expires: string;
}

export const isSecureContext = env.APP_ENV !== "development";

/** Validate Supabase JWT Token and map to HRM User */
export const validateToken = async (
  token: string,
): Promise<{
  user_metadata: any;
  user: FullHrmUser;
  expires: string;
} | null> => {
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

    const userEmail = user.email ?? "";
    // Check if user exists in HRM users table
    const hrmRows = await db
      .select()
      .from(HRMUser)
      .where(eq(HRMUser.email, userEmail))
      .limit(1);

    if (hrmRows.length === 0) {
      console.error(`HRM user not found: ${userEmail}`);
      return null;
    }

    return {
      user_metadata: user.user_metadata,
      user: hrmRows[0] as FullHrmUser,
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

export const auth = async (): Promise<FullSession | null> => {
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
};
