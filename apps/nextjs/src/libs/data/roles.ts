import { createServerClient } from "@acme/supabase";

import { logger } from "../logger";

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export async function getAllRoles(): Promise<Role[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("created_at", { ascending: false });
  logger.error("Error fetching roles", {
    error,
  });
  if (error) throw new Error(error.message);

  return data as Role[];
}

export async function getRoleById(id: string): Promise<Role> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single();
  logger.error("Error fetching role by ID", {
    id,
    error,
  });
  if (error) throw new Error(error.message);

  return data as Role;
}
