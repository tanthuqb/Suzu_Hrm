import { log } from "console";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createServerClient } from "@acme/supabase";

import { env } from "~/env";
import { logger } from "~/libs/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    logger.info("Auth callback received", { hasCode: Boolean(code), next });

    if (!code) {
      logger.error("No code provided in callback");
      return NextResponse.redirect(`${origin}/login/invalid-email`);
    }

    const supabaseUrl = env.PUBLIC_SUPABASE_URL;
    const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      logger.error("Missing Supabase environment variables");
      return NextResponse.redirect(`${origin}/auth-code-error`);
    }

    // Create a response object
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error("Session exchange error", { error: error.message });
      return NextResponse.redirect(`${origin}/login/auth-code-error`);
    }

    // Check if this is a Google login
    const isGoogleLogin = data.session.user.app_metadata.provider === "google";
    const provider = data.session.user.app_metadata.provider ?? "email";

    // Get user agent for device info
    const userAgent = request.headers.get("user-agent") ?? "unknown";
    const ipAddress = request.headers.get("x-forwarded-for") ?? "unknown";

    // Log the successful authentication
    logger.info(`User authenticated via ${provider}`, {
      userId: data.session.user.id,
      email: data.session.user.email,
      provider,
      isGoogleLogin,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
    });

    // Explicitly get and log all cookies for debugging
    const allCookies = response.cookies.getAll();
    logger.info(
      "Cookies set in response",
      allCookies.map((c) => ({
        name: c.name,
        options: {
          path: c.path,
          sameSite: c.sameSite,
          secure: c.secure,
          httpOnly: c.httpOnly,
        },
      })),
    );

    // Ensure session is properly established
    if (
      !allCookies.some(
        (c) => c.name === "sb-access-token" || c.name === "sb-refresh-token",
      )
    ) {
      logger.warn("Session cookies not found in response");
    }

    return response;
  } catch (error) {
    logger.error("Error in auth callback", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.redirect(`${origin}/login/auth-code-error`);
  }
}
