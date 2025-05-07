import type { CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { env } from "~/env";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = env.PUBLIC_SUPABASE_URL;
    const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY;

    // Kiểm tra biến môi trường
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables" }),
        { status: 500 },
      );
    }

    // Tạo client từ server với cookies
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value || "";
        },
        set(name: string, value: string, options: CookieOptions) {
          console.log("Set cookie:", { name, value, options });
        },
        remove(name: string) {
          console.log("Remove cookie:", name);
        },
      },
    });

    // Lấy session từ server-side
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      return new Response(JSON.stringify({ error: "Không tìm thấy session" }), {
        status: 401,
      });
    }

    // Log session để kiểm tra
    console.log("Session từ server:", data.session);

    // Trả về session cho client
    return new Response(JSON.stringify({ session: data.session }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Lỗi lấy session từ server:", err.message);
    return new Response(
      JSON.stringify({ error: "Lỗi máy chủ: " + err.message }),
      { status: 500 },
    );
  }
}
