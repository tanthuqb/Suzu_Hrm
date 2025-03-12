"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "../../../../../../packages/supabase/src/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.error("Failed to set session:", error);
          router.push("/auth/auth-code-error"); // Redirect khi lỗi
        } else {
          console.log("Login successful!");
          router.push("/"); // Redirect về home hoặc dashboard
        }
      } else {
        console.error("No access token found in URL");
        router.push("/auth/auth-code-error"); // Nếu không có token
      }
    };

    handleOAuthRedirect();
  }, [router, supabase.auth]);

  return <p>Đang xử lý đăng nhập...</p>;
}
