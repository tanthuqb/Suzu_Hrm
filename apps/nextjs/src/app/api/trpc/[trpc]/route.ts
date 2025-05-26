import type { NextRequest } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import type { FullSession } from "@acme/auth";
import { appRouter, createTRPCContext } from "@acme/api";
import { validateToken } from "@acme/auth";
import { createServerClient } from "@acme/supabase";

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

const handler = async (req: NextRequest) => {
  try {
    console.log(">>> tRPC Request:", {
      url: req.url,
      method: req.method,
    });

    const supabase = await createServerClient();

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
    const validatedSessionRaw = session?.access_token
      ? await validateToken(session.access_token)
      : null;
    const validatedSession: FullSession | null = validatedSessionRaw
      ? {
          authUser: validatedSessionRaw.user_metadata,
          hrmUser: {
            ...validatedSessionRaw.user,
            roleId: validatedSessionRaw.user.roleId ?? "",
            roleName: validatedSessionRaw.user.roleName ?? "",
          },
          expires: validatedSessionRaw.expires,
        }
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

    // Set CORS headers
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
