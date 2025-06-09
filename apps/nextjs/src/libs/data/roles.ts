import { createServerClient } from "@acme/supabase";

export async function getAllRoles() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getRoleById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}
