import type { JwtPayload } from "jsonwebtoken";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

import { db } from "@acme/db/client";
import { HRMUser } from "@acme/db/schema"; // Bảng users hệ thống HRM (có cột supabase_user_id)

import { supabase } from "../../supabase/index";
import { env } from "../env";

// Define type for HRM User row
export interface HRMUserRow {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  role: string;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const isSecureContext = env.NODE_ENV !== "development";

/** Validate Supabase JWT Token và map về HRM User */
export const validateToken = async (
  token: string,
): Promise<{ user: HRMUserRow; expires: string } | null> => {
  const jwtToken = token.startsWith("Bearer ")
    ? token.slice("Bearer ".length)
    : token;

  try {
    // Decode JWT để lấy thông tin
    const decoded = jwt.decode(jwtToken) as JwtPayload | null;

    if (!decoded || typeof decoded !== "object") {
      console.error("Invalid token structure");
      return null;
    }

    // Kiểm tra user có tồn tại trong bảng HRM users (liên kết với Supabase user)
    const user = await db
      .select()
      .from(HRMUser)
      .where(eq(HRMUser.supabaseUserId, decoded.sub!))
      .limit(1)
      .execute()
      .then((rows) => rows[0] || null);

    if (!user) {
      console.error("User not found in HRM system");
      return null;
    }

    return {
      user,
      expires: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : "",
    };
  } catch (err) {
    console.error("Token validation failed:", err);
    return null;
  }
};

/** Logout/Inactivate session (Client sẽ dùng supabase.auth.signOut) */
export const invalidateSessionToken = async () => {
  await supabase.auth.signOut();
};

/** Client side lấy thông tin người dùng hiện tại */
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to get current user:", error);
    return null;
  }

  return user;
};
