import { fileURLToPath } from "url";
import createJiti from "jiti";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  env: {
    PUBLIC_APP_CLIENT_URL: process.env.PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY,
  },
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@acme/api",
    "@acme/auth",
    "@acme/db",
    "@acme/ui",
    "@acme/validators",
    "@acme/supabase",
  ],

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default config;
