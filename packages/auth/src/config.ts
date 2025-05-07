import { eq } from "drizzle-orm";

import type { FullHrmUser } from "@acme/db";
import { db } from "@acme/db/client";
import { HRMUser, Permission, Role } from "@acme/db/schema";

import { createBrowserClient, createServerClient } from "../../supabase/src";
import { env } from "../env";

export interface Session {
  user: {
    id: string;
    employeeCode?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    roleId?: string;
    phone?: string;
    status?: string;
    departmentId?: string;
    departments?: {
      name?: string;
    };
    image?: string;
  };
  expires: string;
  role?: string;
}

export const isSecureContext = env.APP_ENV !== "development";

/** Validate Supabase JWT Token and map to HRM User */
export const validateToken = async (
  token: string,
): Promise<{ user: FullHrmUser; expires: string } | null> => {
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
    const hrmUser = await db
      .select()
      .from(HRMUser)
      .where(eq(HRMUser.email, userEmail))
      .limit(1);

    if (hrmUser.length === 0 || !hrmUser[0]) {
      throw new Error(`HRM user not found with email: ${userEmail}`);
    }

    return {
      user: hrmUser[0] as FullHrmUser,
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
        permission: {
          module: Permission.module,
          action: Permission.action,
          type: Permission.type,
          allow: Permission.allow,
        },
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
      user: hrmUser.user,
      expires: hrmUser.expires,
      role,
    };
  } catch (error) {
    console.error("Error during authentication:", error);
    return null;
  }
};
