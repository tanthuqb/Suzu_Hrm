import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { schema } from "./schema";

// Xác định connection string phù hợp môi trường
const connectionString =
  process.env.APP_ENV === "production"
    ? process.env.POSTGRES_URL
    : process.env.SUPABASE_DB_POOL_URL;

if (!connectionString) {
  throw new Error("Database connection string is not defined.");
}

// Kết nối postgres client qua postgres-js (Supabase backend)
const client = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
});
// Tạo drizzle instance
export const db = drizzle(client, { schema });
