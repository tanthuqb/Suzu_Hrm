"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var postgres_js_1 = require("drizzle-orm/postgres-js");
var postgres_1 = require("postgres");
var schema = require("./schema");
// Xác định connection string phù hợp môi trường
var connectionString = process.env.APP_ENV === "production"
    ? process.env.POSTGRES_URL
    : process.env.SUPABASE_DB_POOL_URL;
if (!connectionString) {
    throw new Error("Database connection string is not defined.");
}
// Kết nối postgres client qua postgres-js (Supabase backend)
var client = (0, postgres_1.default)(connectionString, {
    ssl: { rejectUnauthorized: false },
});
// Tạo drizzle instance
exports.db = (0, postgres_js_1.drizzle)(client, { schema: schema });
