import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createServerClient } from "@acme/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      console.error("Không có session:", error);
      return NextResponse.json(
        { error: error?.message ?? "Phiên không tồn tại" },
        { status: 401 },
      );
    }

    // Log session để kiểm tra
    console.log("Session từ server:", session);

    // Trả về session cho client
    return new Response(JSON.stringify({ session: session }), {
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
