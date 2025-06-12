import { z } from "zod";

import { getAllTrpcActions } from "@acme/api";
import { createServerClient } from "@acme/supabase";

import { logger } from "../logger";

export type ActionType = "query" | "mutation";
export interface PermissionAction {
  module: string;
  action: string;
  type: ActionType;
  allow?: boolean;
}

export interface RolePermission {
  role: string;
  permissions: {
    module: string;
    action: string;
    type: ActionType;
    allow: boolean;
  }[];
}

const permissionSchema = z.object({
  roleId: z.string().uuid(),
  module: z.string(),
  action: z.string(),
  type: z.enum(["mutation", "query"]),
  allow: z.boolean(),
});

export async function getAllActions() {
  const actions = getAllTrpcActions();
  return actions as PermissionAction[];
}

export async function getPermissionsByRole(
  roleId: string,
): Promise<RolePermission> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("permissions")
    .select("module, action, type, allow, role:role_id(name)")
    .eq("role_id", roleId);
  logger.error("Error fetching permissions by role", {
    roleId,
    error,
  });
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    return {
      role: "guest",
      permissions: [],
    };
  }

  const roleName = Array.isArray(data[0]?.role)
    ? (data[0].role[0]?.name ?? "guest")
    : ((data[0] as any)?.role?.name ?? "guest");

  return {
    role: roleName,
    permissions: data.map((p: any) => ({
      module: p.module,
      action: p.action,
      type: p.type,
      allow: p.allow,
    })),
  };
}

export async function savePermissions(payload: {
  roleId: string;
  actions: z.infer<typeof permissionSchema>[];
}): Promise<{ message: string }> {
  const supabase = await createServerClient();

  // Xoá quyền cũ
  const { error: delError } = await supabase
    .from("permissions")
    .delete()
    .eq("role_id", payload.roleId);
  logger.error("Error deleting old permissions", {
    roleId: payload.roleId,
    error: delError,
  });

  if (delError) throw new Error(delError.message);

  // Insert mới
  const { error: insError } = await supabase.from("permissions").insert(
    payload.actions.map((a) => ({
      ...a,
      role_id: payload.roleId,
    })),
  );
  logger.error("Error inserting new permissions", {
    roleId: payload.roleId,
    actions: payload.actions,
    error: insError,
  });

  if (insError) throw new Error(insError.message);

  return { message: "Lưu quyền thành công" };
}

export async function checkPermission({
  roleId,
  module,
  action,
}: {
  roleId: string;
  module: string;
  action: string;
}): Promise<boolean> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("permissions")
    .select("allow")
    .eq("role_id", roleId)
    .eq("module", module)
    .eq("action", action)
    .limit(1)
    .single();
  logger.error("Error checking permission", {
    roleId,
    module,
    action,
    error,
  });

  if (error || !data) return false;
  return data.allow;
}
