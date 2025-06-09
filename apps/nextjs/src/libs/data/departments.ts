import { createServerClient } from "@acme/supabase";

export async function getAllDepartments() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function getDepartmentById(id: number) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}
