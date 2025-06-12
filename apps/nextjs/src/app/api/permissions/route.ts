import { NextResponse } from "next/server";

import { checkPermissionOrThrow, createTRPCContext } from "@acme/api";

import { getAllActions, savePermissions } from "~/libs/data/permisions";

export async function GET(req: Request) {
  const headers = req.headers;
  const ctx = await createTRPCContext({ headers, session: null });

  try {
    await checkPermissionOrThrow(ctx, "permission", "getAllActions");
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message ?? "Forbidden" },
      { status: 403 },
    );
  }

  const data = await getAllActions();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const headers = req.headers;
  const ctx = await createTRPCContext({ headers, session: null });
  try {
    await checkPermissionOrThrow(ctx, "permission", "saveActions");
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message ?? "Forbidden" },
      { status: 403 },
    );
  }
  const body = await req.json();
  try {
    await savePermissions(body);
    return NextResponse.json({ ok: true, message: "Lưu thành công" });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 },
    );
  }
}
