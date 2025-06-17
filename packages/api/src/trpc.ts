import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import type { FullSession } from "@acme/auth";
import { auth, validateToken } from "@acme/auth";
import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { AuditLogs, Permission } from "@acme/db/schema";

import { logger } from "../../../apps/nextjs/src/libs/logger";

/**
 * Isomorphic Session getter for API requests
 * - Expo requests will have a session token in the Authorization header
 * - Next.js requests will have a session token in cookies
 */
const isomorphicGetSession = async (
  headers: Headers,
): Promise<FullSession | null> => {
  const authToken = headers.get("Authorization") ?? null;
  if (authToken) {
    const validatedSession = await validateToken(authToken);
    if (validatedSession) {
      return {
        authUser: {
          id: validatedSession.user.id,
          email: validatedSession.user.email,
          app_metadata: validatedSession.user_metadata,
        },
        hrmUser: {
          ...validatedSession.user,
          roleId: validatedSession.user.roleId ?? "",
          roleName: validatedSession.user.roleName ?? "guest",
        },
        expires: validatedSession.expires,
      };
    }
  }
  return auth();
};

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  session: FullSession | null;
}) => {
  const session = await isomorphicGetSession(opts.headers);
  let permissions: { module: string; action: string; allow: boolean }[] = [];
  if (session?.hrmUser.roleId) {
    const rawPermissions = await db
      .select()
      .from(Permission)
      .where(eq(Permission.roleId, session.hrmUser.roleId));
    permissions = rawPermissions.map((p) => ({
      module: p.module,
      action: p.action,
      allow: p.allow ?? false,
    }));
  }

  const source = opts.headers.get("x-trpc-source") ?? "unknown";
  logger.info(
    `>>> Creating tRPC context for source: ${source}, session: ${session?.hrmUser.email ?? "none"}`,
  );

  return {
    session,
    db,
    permissions,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  logger.info(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Middleware for logging tRPC calls, including mutations and audit logs.
 * This middleware logs the call details and writes an audit log entry for mutations.
 * It also handles errors that occur during the logging process.
 * @see https://trpc.io/docs/server/middleware
 */

const loggingMiddleware = t.middleware(async (opts) => {
  const { ctx, next, path, getRawInput, type } = opts;
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;

  const isMutation = type === "mutation";
  if (isMutation) {
    const userId = ctx.session?.authUser.id ?? "unknown";
    const rawInput = await getRawInput();

    const inputStr = JSON.stringify(rawInput);
    const shortInputStr =
      inputStr.length > 500 ? inputStr.slice(0, 500) + "..." : inputStr;
    logger.info(
      `[TRPC] ${path} called by user ${userId} with input: ${shortInputStr}, took ${duration}ms`,
    );

    const responseData = (result as any)?.data ?? result ?? {};

    try {
      await ctx.db.insert(AuditLogs).values({
        userId,
        action: path || "unknown",
        entity: path.split(".")[0] || "unknown",
        payload: JSON.stringify(rawInput ?? {}),
        request: JSON.stringify(rawInput ?? {}),
        response: JSON.stringify(responseData),
        createdAt: new Date(),
      });
    } catch (err) {
      logger.error("Failed to write AuditLog", { error: err });
    }
  }
  return result;
});

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure
  .use(timingMiddleware)
  .use(loggingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */

export const protectedProcedure: typeof publicProcedure = t.procedure
  .use(timingMiddleware)
  .use(loggingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.hrmUser) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.hrmUser },
      },
    });
  });
