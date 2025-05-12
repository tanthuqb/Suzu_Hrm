import type { CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { isValidEmail } from "~/app/libs/validate";
import { env } from "~/env";

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    console.log("Auth callback received:", { hasCode: Boolean(code), next });

    if (!code) {
      console.error("No code provided in callback");
      return NextResponse.redirect(`${origin}/login/invalid-email`);
    }

    const supabaseUrl = env.PUBLIC_SUPABASE_URL;
    const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.redirect(`${origin}/auth-code-error`);
    }

    // Create a response object
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log("Session exchange data:", data);
    console.log("Session exchange error:", error);

    if (error) {
      console.error("Session exchange error:", error);
      return NextResponse.redirect(`${origin}/login/auth-code-error`);
    }

    if (data.session.user.email) {
      const email = data.session.user.email;

      if (!isValidEmail(email)) {
        await supabase.auth.signOut();
        const allRequestCookies = request.cookies.getAll();
        console.log("Request cookies before deletion:", allRequestCookies);
        allRequestCookies.forEach(({ name }) => {
          response.cookies.delete(name);
        });
        console.log("Cookies after deletion:", response.cookies.getAll());
        return NextResponse.redirect(`${origin}/login/invalid-email`);
      }

      // Log complete session information for debugging
      console.log("Session exchange successful:", {
        userId: data.session.user.id,
        email: data.session.user.email,
        expiresAt: data.session.expires_at,
        tokenType: data.session.token_type,
        hasCookies: response.cookies.getAll().length > 0,
      });

      // Explicitly get and log all cookies for debugging
      const allCookies = response.cookies.getAll();
      console.log(
        "Cookies set in response:",
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
        console.warn("Warning: Session cookies not found in response");
      }
    } else {
      console.error("Email not found in session data");
      return NextResponse.redirect(`${origin}/login/auth-code-error`);
    }
    return response;
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(`${origin}/login/auth-code-error`);
  }
}
