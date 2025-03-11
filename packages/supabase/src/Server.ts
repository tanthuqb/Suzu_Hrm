import type { CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  // Create a response object that we can modify
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client configured for the Edge Runtime
  const supabase = createServerClient(
    // Use direct environment variables instead of dotenv
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      auth: {
        persistSession: false, // Don't persist the session in Edge Runtime
      },
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
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  await supabase.auth.getSession();

  return response;
}
