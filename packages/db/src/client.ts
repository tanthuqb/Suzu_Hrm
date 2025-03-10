/* eslint-disable turbo/no-undeclared-env-vars */
// import { sql } from "@vercel/postgres";
// import { drizzle } from "drizzle-orm/vercel-postgres";

// import * as schema from "./schema";

// export const db = drizzle({
//   client: sql,
//   schema,
//   casing: "snake_case",
// });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

// Xác định connection string phù hợp môi trường
const connectionString =
  process.env.NODE_ENV === "production"
    ? process.env.SUPABASE_DB_POOL_URL
    : process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("Database connection string is not defined.");
}

// Kết nối postgres client qua postgres-js (Supabase backend)
const client = postgres(connectionString, { ssl: "require" });

// Tạo drizzle instance
export const db = drizzle(client, { schema });
