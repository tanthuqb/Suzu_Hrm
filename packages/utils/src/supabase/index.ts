import type { SupabaseClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";

/**
 * Trả về Map<EmployCode, userId> từ Supabase table "users"
 */
export async function getEmployCodeToUserIdMap(
  supabase: SupabaseClient,
): Promise<Map<string, string>> {
  const { data: users, error } = await supabase
    .from("users")
    .select("id, employee_code");

  if (error || !users) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        error.message ?? "Không thể lấy danh sách người dùng từ Supabase",
    });
  }

  const map = new Map<string, string>();
  for (const user of users) {
    if (user.employee_code) {
      map.set(user.employee_code.toLowerCase(), user.id);
    }
  }

  return map;
}
