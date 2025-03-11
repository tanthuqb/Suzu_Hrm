import type { CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import dotenv from "dotenv";

dotenv.config();
const EXPO_COOKIE_NAME = "__acme-expo-redirect-state";

/**
 * Initialize Supabase client per request.
 */
function getSupabaseClient(req: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    },
  );
  return { supabase, response };
}

/**
 * Noop in production.
 * In development, rewrite the request URL to use localhost instead of host IP address
 * so that Expo Auth works without CSRF protection issues.
 */
function rewriteRequestUrlInDevelopment(req: NextRequest) {
  if (process.env.NODE_ENV === "production") return req;

  const host = req.headers.get("host");
  const newURL = new URL(req.url);
  newURL.host = host ?? req.nextUrl.host;
  return new NextRequest(newURL, req);
}

/**
 * Handle Expo callback logic after Supabase auth.
 */
async function handleExpoSigninCallback(req: NextRequest, redirectURL: string) {
  const { response } = getSupabaseClient(req);

  // After successful authentication, assume Supabase sets the "sb:token"
  const sessionToken = req.cookies.get("sb:token")?.value;

  // Clear the Expo redirect state cookie
  response.cookies.set(EXPO_COOKIE_NAME, "", { maxAge: 0, path: "/" });

  if (!sessionToken) {
    throw new Error("Unable to find Supabase session token.");
  }

  // Append the session token to redirect URL
  const url = new URL(redirectURL);
  url.searchParams.set("session_token", sessionToken);

  return NextResponse.redirect(url);
}

export const POST = async (
  _req: NextRequest,
  props: { params: Promise<{ nextauth: string[] }> },
) => {
  const req = rewriteRequestUrlInDevelopment(_req);
  const { supabase, response } = getSupabaseClient(req);

  const nextauthAction = (await props.params).nextauth[0]; // Reuse route logic
  const isExpoCallback = req.cookies.get(EXPO_COOKIE_NAME);

  if (nextauthAction === "callback" && !!isExpoCallback) {
    return handleExpoSigninCallback(req, isExpoCallback.value);
  }

  // Handle Supabase sign-in callback if applicable (e.g., OAuth providers)
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // Return the response with any cookies set
  return response;
};

export const GET = async (
  _req: NextRequest,
  props: { params: Promise<{ nextauth: string[] }> },
) => {
  const req = rewriteRequestUrlInDevelopment(_req);
  const { supabase, response } = getSupabaseClient(req);

  const nextauthAction = (await props.params).nextauth[0];
  const isExpoSignIn = req.nextUrl.searchParams.get("expo-redirect");
  const isExpoCallback = req.cookies.get(EXPO_COOKIE_NAME);

  // Handle Expo redirect setup for sign-in
  if (nextauthAction === "signin" && !!isExpoSignIn) {
    response.cookies.set(EXPO_COOKIE_NAME, isExpoSignIn, {
      maxAge: 60 * 10, // 10 min
      path: "/",
    });
    return response;
  }

  // Handle Expo redirect after callback
  if (nextauthAction === "callback" && !!isExpoCallback) {
    return handleExpoSigninCallback(req, isExpoCallback.value);
  }

  // Example: Check current user session (adjust per needs)
  const { data: sessionData, error } = await supabase.auth.getSession();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // You can adjust the response or redirect based on session presence
  return NextResponse.json({ session: sessionData.session });
};
