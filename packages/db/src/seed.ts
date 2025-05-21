import { randomUUID } from "crypto";

import { db } from "./client.js";
import { Department, Permission, Role } from "./schema.js";

async function main() {
  const adminRoleId = randomUUID();
  const userRoleId = randomUUID();
  const depNTLId = randomUUID();
  const depSkyId = randomUUID();

  // Seed roles
  await db.insert(Role).values([
    { id: adminRoleId, name: "Admin", description: "Quản trị viên" },
    { id: userRoleId, name: "User", description: "Nhân viên" },
  ]);
  // Seed departments
  await db.insert(Department).values([
    {
      id: depNTLId,
      name: "No Trang Long",
      description: "Văn phòng NTL",
      office: "NTL",
    },
    {
      id: depSkyId,
      name: "Sky",
      description: "Văn phòng SKY",
      office: "SKY",
    },
  ]);
  // Seed permissions
  await db.insert(Permission).values([
    {
      id: randomUUID(),
      roleId: adminRoleId,
      module: "auth",
      action: "login",
      type: "allow",
      allow: true,
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      roleId: userRoleId,
      module: "auth",
      action: "login",
      type: "allow",
      allow: true,
      createdAt: new Date(),
    },
  ]);

  console.log("Seed thành công!");
}
