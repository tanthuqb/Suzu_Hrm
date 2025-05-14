import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@acme/auth";

import { env } from "~/env";

const EXPO_COOKIE_NAME = "__acme-expo-redirect-state";

function rewriteRequestUrlInDevelopment(req: NextRequest) {
  if (env.APP_ENV === "production") return req;
  const host = req.headers.get("host") ?? req.nextUrl.host;
  const url = new URL(req.url);
  url.host = host;
  return new NextRequest(url, req);
}

function handleExpoSigninCallback(req: NextRequest, redirectURL: string) {
  const res = NextResponse.next();
  const token = req.cookies.get("sb:token")?.value;
  res.cookies.set(EXPO_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  if (!token) throw new Error("Supabase session token missing.");
  const url = new URL(redirectURL);
  url.searchParams.set("session_token", token);
  return NextResponse.redirect(url);
}

export const POST = async (
  _req: NextRequest,
  props: { params: Promise<{ nextauth: string[] }> },
) => {
  const req = rewriteRequestUrlInDevelopment(_req);
  const action = (await props.params).nextauth[0];
  const expoState = req.cookies.get(EXPO_COOKIE_NAME)?.value;

  // Expo OAuth callback
  if (action === "callback" && expoState) {
    return handleExpoSigninCallback(req, expoState);
  }

  // Standard sign-in callback or other POST
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user });
};

export const GET = async (
  _req: NextRequest,
  props: { params: Promise<{ nextauth: string[] }> },
) => {
  const req = rewriteRequestUrlInDevelopment(_req);
  const action = (await props.params).nextauth[0];
  const expoRedirect = req.nextUrl.searchParams.get("expo-redirect");
  const expoState = req.cookies.get(EXPO_COOKIE_NAME)?.value;

  // Step 1: Expo app starts OAuth
  if (action === "signin" && expoRedirect) {
    const res = NextResponse.next();
    res.cookies.set(EXPO_COOKIE_NAME, expoRedirect, {
      maxAge: 60 * 10,
      path: "/",
    });
    return res;
  }

  // Step 2: Expo callback
  if (action === "callback" && expoState) {
    return handleExpoSigninCallback(req, expoState);
  }

  // Step 3: Protected route or session check
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user });
};
