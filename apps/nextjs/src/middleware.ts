import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createServerClient, updateSession } from "@acme/supabase";

export const config = {
  matcher: [
    // Loại bỏ file tĩnh & ảnh
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // ✅ KHÔNG can thiệp auth callback
  if (request.nextUrl.pathname === "/api/auth/callback") {
    return NextResponse.next();
  }
  // ✅ Nếu không có token, chuyển hướng
  if (!user && !path.startsWith("/login") && !path.startsWith("/auth")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("message", "Bạn cần đăng nhập.");
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
