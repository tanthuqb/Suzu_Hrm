"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { env } from "~/env";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    async function handleSession() {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");
      const type = searchParams.get("type");
      const next = searchParams.get("next") ?? "/";

      if (type === "recovery" && access_token && refresh_token) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) {
            console.error("❌ setSession error:", error.message);
            router.replace("/auth-code-error");
          } else {
            router.replace(next);
          }
        } catch (err) {
          console.error("❌ Unexpected error:", err);
          router.replace("/auth-code-error");
        }
      } else {
        router.replace("/auth-code-error");
      }
    }
    void handleSession();
  }, [router, searchParams]);

  return null;
}
