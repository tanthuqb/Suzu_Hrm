import type { SupabaseClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";

/**
 * Trả về Map<email, userId> từ Supabase table "users"
 */
export async function getEmailToUserIdMap(
  supabase: SupabaseClient,
): Promise<Map<string, string>> {
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email");

  if (error || !users) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        error?.message ?? "Không thể lấy danh sách người dùng từ Supabase",
    });
  }

  const map = new Map<string, string>();
  for (const user of users) {
    if (user.email) {
      map.set(user.email.toLowerCase(), user.id);
    }
  }

  return map;
}
