"use server";

import { TRPCError } from "@trpc/server";

import type { createServerClient } from "@acme/supabase";

export async function getEmailToUserIdMap(
  supabase: ReturnType<typeof createServerClient>,
) {
  const { data: users, error } = await (await supabase)
    .from("users")
    .select("id,email");

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        error.message ?? "Không thể lấy danh sách người dùng từ Supabase",
    });
  }

  const emailToIdMap = new Map<string, string>();
  for (const user of users) {
    if (user.email) {
      emailToIdMap.set(user.email.toLowerCase(), user.id);
    }
  }

  return emailToIdMap;
}
