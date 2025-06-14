"use server";

import { redirect } from "next/navigation";

import type { AuthUser } from "@acme/db";
import { VALID_ROLES } from "@acme/db/constants";
import { createServerClient } from "@acme/supabase";

import { env } from "~/env";

/**
 * Sign in the user with Google
 * @returns {Promise<any>} - Returns user data
 */

export const handleSignInWithGoogle = async () => {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      skipBrowserRedirect: false,
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

/**
 * Check if the user is authenticated
 * @returns {Promise<{ status: boolean; message?: string; user?: AuthUser }>} - Returns authentication status and user data
 */

export const checkAuth = async (): Promise<{
  status: boolean;
  message?: string;
  user?: AuthUser;
}> => {
  const supabase = await createServerClient();
  const { data: authUser, error: authError } = await supabase.auth.getUser();

  if (authError) {
    return {
      status: false,
      message: "Bạn cần đăng nhập hoặc phiên đã hết hạn.",
    };
  }

  const { data: rows, error: dbError } = await supabase
    .from("users")
    .select(
      `
    id,
    firstName,
    lastName,
    email,
    status,
    role_id,
    role:role_id (
      id,
      name,
      permissions( id, action )
    ),
    position:position_id (
      id, 
      name
    ),
    department:department_id (
      id,
      name
    )
  `,
    )
    .eq("email", authUser.user.email)
    .maybeSingle();
  if (dbError || !rows) {
    return {
      status: false,
      message: "Không tìm thấy tài khoản trong hệ thống.",
    };
  }

  if (rows.status !== "active") {
    return {
      status: false,
      message: "Tài khoản bị khóa hoặc không hoạt động.",
    };
  }

  const role = Array.isArray(rows.role) ? rows.role[0] : rows.role;
  const department = Array.isArray(rows.department)
    ? rows.department[0]
    : rows.department;
  const position = Array.isArray(rows.position)
    ? rows.position[0]
    : rows.position;

  if (!role) {
    return {
      status: false,
      message: "Bạn không có quyền truy cập.",
    };
  }

  const user = {
    id: rows.id,
    firstName: rows.firstName,
    lastName: rows.lastName,
    email: rows.email,
    role_id: rows.role_id,
    roleName: role.name,
    status: rows.status,
    departments: department
      ? {
          id: department.id,
          name: department.name,
        }
      : undefined,
    role: role,
    positions: position
      ? {
          id: position.id,
          name: position.name,
        }
      : undefined,
    permissions: Array.isArray(role.permissions)
      ? role.permissions.map((permission: any) => ({
          action: permission.action,
          id: permission.id,
        }))
      : [],
  };

  return { status: true, user };
};

/**
 * Sign out the user
 * @returns {Promise<void>} - Returns nothing
 */
export const signOut = async () => {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Update the user's status
 * @param email - The email address of the user
 * @param newStatus - The new status to set
 * @returns {Promise<any>} - Returns success message
 */
export const updateStatus = async (email: string, newStatus: string) => {
  const supabase = await createServerClient();
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (userError) {
    console.error("User lookup error:", userError);
    throw new Error(userError.message);
  }

  if (!userData) {
    console.error("User not found");
    throw new Error("User not found");
  }
  const user = userData as AuthUser;

  const { error } = await supabase
    .from("users")
    .update({ status: newStatus })
    .eq("id", user.id);
  if (error) {
    console.error("Status update error:", error);
    throw new Error(error.message);
  }

  return { success: true };
};

/**
 * Check if the user has the required role
 * @param roles - The roles to check against
 * @returns {Promise<{ status: boolean; user?: AuthUser; message?: string }>} - Returns authentication status and user data
 */

export const checkRole = async (
  roles: string[],
): Promise<{ status: boolean; user?: AuthUser; message?: string }> => {
  const auth = await checkAuth();
  if (!auth.status || !auth.user) {
    return { status: false, message: "Bạn cần đăng nhập." };
  }

  const userRole = (auth.user.roleName ?? "").toLowerCase();
  const validRoles = VALID_ROLES.map((r) => r.toLowerCase());

  const allowedRoles = roles.map((r) => r.toLowerCase());

  if (!userRole || !validRoles.includes(userRole)) {
    return {
      status: false,
      message: "Tài khoản chưa được gán quyền hoặc quyền không hợp lệ.",
    };
  }
  if (!allowedRoles.includes(userRole)) {
    return { status: false, message: "Bạn không có quyền truy cập." };
  }
  return { status: true, user: auth.user };
};
