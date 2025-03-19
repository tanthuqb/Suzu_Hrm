import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@acme/api";
import { validateToken } from "@acme/auth";

import { env } from "~/env";

const setCorsHeaders = (res: Response) => {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Request-Method", "*");
  res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.headers.set("Access-Control-Allow-Headers", "*");
};

export const OPTIONS = () => {
  const response = new Response(null, { status: 204 });
  setCorsHeaders(response);
  return response;
};

interface CookieOptions {
  name: string;
  value?: string;
  [key: string]: unknown;
}

const handler = async (req: NextRequest) => {
  try {
    console.log(">>> tRPC Request:", {
      url: req.url,
      method: req.method,
    });

    // Create Supabase client
    const supabase = createServerClient(
      env.PUBLIC_SUPABASE_URL,
      env.PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            req.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            req.cookies.delete({ name, ...options });
          },
        },
      },
    );

    // Get session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(">>> Session Error:", sessionError);
      throw sessionError;
    }

    console.log(">>> Session:", session);

    // Validate token and get HRM user data
    const validatedSession = session?.access_token
      ? await validateToken(session.access_token)
      : null;

    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      router: appRouter,
      req,
      createContext: () =>
        createTRPCContext({
          session: validatedSession,
          headers: req.headers,
        }),
      onError({ error, path }) {
        console.error(`>>> tRPC Error on '${path}'`, error);
      },
    });

    const clientIp = req.headers.get("x-forwarded-for");
    if (clientIp) {
      console.log("IP HOSTING", clientIp);
    }

    setCorsHeaders(response);
    return response;
  } catch (error) {
    console.error(">>> Unhandled Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

export { handler as GET, handler as POST };
