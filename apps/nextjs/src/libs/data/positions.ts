import { createServerClient } from "@acme/supabase";

export async function getAllPositions() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("positions")
    .select(
      `id, name, department_id, created_at, updated_at, department:department_id(id, name)`,
    )
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function getPositionById(id: number) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("positions")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}
