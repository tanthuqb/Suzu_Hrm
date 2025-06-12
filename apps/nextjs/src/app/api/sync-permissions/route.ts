import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import {
  checkPermissionOrThrow,
  createTRPCContext,
  getAllTrpcActions,
} from "@acme/api";
import { db } from "@acme/db/client";
import { Permission } from "@acme/db/schema";

export async function POST(req: Request) {
  try {
    const actions = getAllTrpcActions();

    const records = actions.map((item) => ({
      module: item.module,
      action: item.action,
      type: item.type,
      allow: true,
      roleId: null,
      createdAt: new Date(),
      updatedAt: null,
    }));

    await db.delete(Permission).where(sql`true`);
    await db.insert(Permission).values(records);

    return NextResponse.json({ ok: true, count: records.length });
  } catch (err) {
    console.error("[SYNC_PERMISSION_ERROR]", err);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
