// filepath: c:\CongLoc\hrm\apps\nextjs\src\app\api\auth\route.ts
import { NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@acme/supabase";

const EXPO_COOKIE_NAME = "__acme-expo-redirect-state";

/**
 * Rewrite URL to localhost in dev to avoid IP issues with Expo.
 */
function rewriteRequestUrlInDevelopment(req: NextRequest) {
  if (process.env.NODE_ENV === "production") return req;

  const host = req.headers.get("host");
  const newURL = new URL(req.url);
  newURL.host = host ?? req.nextUrl.host;
  return new NextRequest(newURL, req);
}

/**
 * Handle Expo OAuth callback flow.
 */
async function handleExpoSigninCallback(req: NextRequest, redirectURL: string) {
  const response = NextResponse.next();
  const sessionToken = req.cookies.get("sb:token")?.value;

  // Clear redirect cookie after use
  response.cookies.set(EXPO_COOKIE_NAME, "", { maxAge: 0, path: "/" });

  if (!sessionToken) throw new Error("Supabase session token missing.");

  // Redirect with session_token back to Expo app
  const url = new URL(redirectURL);
  url.searchParams.set("session_token", sessionToken);

  return NextResponse.redirect(url);
}

/**
 * POST handler for Supabase auth (OAuth callback, session check)
 */
export const POST = async (
  _req: NextRequest,
  props: { params: Promise<{ nextauth: string[] }> },
) => {
  const req = rewriteRequestUrlInDevelopment(_req);
  const response = NextResponse.next();
  const supabase = await createServerClient();
  const nextauthAction = (await props.params).nextauth[0];
  const isExpoCallback = req.cookies.get(EXPO_COOKIE_NAME);

  // Handle Expo OAuth callback
  if (nextauthAction === "callback" && isExpoCallback) {
    return handleExpoSigninCallback(req, isExpoCallback.value);
  }

  // Handle normal Supabase session check
  const { data, error } = await supabase.auth.getSession();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 401 });

  // Return cookies for next usage
  return response;
};

/**
 * GET handler for Supabase OAuth flow and session checks.
 */
export const GET = async (
  _req: NextRequest,
  props: { params: Promise<{ nextauth: string[] }> },
) => {
  const req = rewriteRequestUrlInDevelopment(_req);
  const response = NextResponse.next();
  const supabase = await createServerClient();
  const nextauthAction = (await props.params).nextauth[0];
  const isExpoSignIn = req.nextUrl.searchParams.get("expo-redirect");
  const isExpoCallback = req.cookies.get(EXPO_COOKIE_NAME);

  // Expo app prepares redirect
  if (nextauthAction === "signin" && isExpoSignIn) {
    response.cookies.set(EXPO_COOKIE_NAME, isExpoSignIn, {
      maxAge: 60 * 10, // 10 mins
      path: "/",
    });
    return response;
  }

  // Expo callback handling
  if (nextauthAction === "callback" && isExpoCallback) {
    return handleExpoSigninCallback(req, isExpoCallback.value);
  }

  // Session check (e.g. protected route)
  const { data: sessionData, error } = await supabase.auth.getSession();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 401 });

  // Return current session
  return NextResponse.json({ session: sessionData.session });
};
