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
    error: authError,
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const publicPaths = ["/login", "/auth-code-error", "/api/auth/callback"];

  // ✅ KHÔNG can thiệp auth callback
  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }
  // ✅ Nếu không có token, chuyển hướng
  if (!user || authError) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("message", "Bạn cần đăng nhập.");
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
