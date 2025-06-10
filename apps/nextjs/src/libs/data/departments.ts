import { createServerClient } from "@acme/supabase";

export interface Department {
  id: string;
  name: string;
  description: string | null;
  office: "SKY" | "NTL" | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export async function getAllDepartments(): Promise<Department[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data as Department[];
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
