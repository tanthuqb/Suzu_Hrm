import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod";

import { env as authEnv } from "@acme/auth/env";

type RuntimeEnv = {
  APP_ENV: string | undefined;
  PUBLIC_SUPABASE_URL: string;
  PUBLIC_SUPABASE_ANON_KEY: string;
};

export const env = createEnv({
  extends: [authEnv, vercel()],
  shared: {
    APP_ENV: z
      .enum(["development", "staging", "production"])
      .default("development"),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    POSTGRES_URL: z.string().url(),
    PORT: z.string().optional(),
    PUBLIC_SUPABASE_URL: z.string().optional(),
    PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_TO: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    APP_ENV: process.env.APP_ENV,
    PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_TO: process.env.EMAIL_TO,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  } as unknown as RuntimeEnv,

  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
