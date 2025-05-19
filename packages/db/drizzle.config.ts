import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const nonPoolingUrl = process.env.SUPABASE_DB_POOL_URL!;

if (!nonPoolingUrl) {
  throw new Error("Missing POSTGRES_URL");
}

export default {
  schema: "./src/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: { url: nonPoolingUrl },
  casing: "snake_case",
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
} satisfies Config;
