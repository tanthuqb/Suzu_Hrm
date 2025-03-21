import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_DISCORD_ID: z.string().min(1),
    AUTH_DISCORD_SECRET: z.string().min(1),
    PUBLIC_APP_URL: z.string().min(1),
    PUBLIC_SUPABASE_URL: z.string().min(1),
    PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    AUTH_SECRET:
      process.env.APP_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    APP_ENV: z.enum(["development", "staging", "production"]).optional(),
  },
  client: {},
  experimental__runtimeEnv: {},
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
