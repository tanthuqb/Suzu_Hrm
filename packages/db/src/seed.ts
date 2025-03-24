import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as XLSX from "xlsx";

import type { DBUser } from "./types/types";
import { db } from "./client";
import { HRMUser } from "./schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function readUsersFromExcel(): Record<string, string>[] {
  const filePath = path.resolve(__dirname, "suzu.xlsx");
  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ File not found: ${filePath}`);
  }

  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("❌ No sheet names found in the workbook");
  }
  const sheet = workbook.Sheets[firstSheetName];
  if (!sheet) {
    throw new Error("❌ Sheet not found in the workbook");
  }

  const data = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "", // Provide a default value for empty cells
  });

  return data;
}

function mapToIUser(raw: Record<string, string>) {
  return {
    id: "random",
    firstName: raw["First Name [Required]"] ?? "",
    lastName: raw["Last Name [Required]"] ?? "",
    email: raw["Email Address [Required]"] ?? "",
    phone: raw["Work Phone"] ?? "",
    role: "user",
    status: raw["Status [READ ONLY]"]?.toLowerCase() ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

const rawUsers = readUsersFromExcel();

const users: DBUser[] = rawUsers.map(mapToIUser);

const usersInsert = JSON.stringify(users, null, 2);

async function seed() {
  console.log("🌱 Seeding data...");
  console.log("Insert Data..");
  console.log("usersInsert", usersInsert);
  await db.insert(HRMUser).values([
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      role: "user",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("✅ Done seeding!");
  process.exit(0);

  seed().catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  });
}
