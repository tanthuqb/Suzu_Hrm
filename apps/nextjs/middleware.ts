import type { CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "edge";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export async function updateSession(request: NextRequest) {
  // Create a response object that we can modify
  const response = NextResponse.next();

  // Create a Supabase client configured for the Edge Runtime
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    },
  );

  await supabase.auth.getSession();

  return response;
}
