import { NextResponse } from "next/server";

import { checkPermissionOrThrow, createTRPCContext } from "@acme/api";

import { getAllAuditLogs } from "~/libs/data/auditlog";

export async function GET(req: Request) {
  const headers = req.headers;
  const ctx = await createTRPCContext({ headers, session: null });

  try {
    await checkPermissionOrThrow(ctx, "auditlog", "getAll");
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message ?? "Forbidden" },
      { status: 403 },
    );
  }
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);

  const filters = {
    userId: searchParams.get("userId") ?? undefined,
    email: searchParams.get("email") ?? undefined,
    action: searchParams.get("action") ?? undefined,
    entity: searchParams.get("entity") ?? undefined,
    request: searchParams.get("request") ?? undefined,
    response: searchParams.get("response") ?? undefined,
    payload: searchParams.get("payload") ?? undefined,
    page,
    pageSize,
  };

  const data = await getAllAuditLogs(filters);
  return NextResponse.json(data);
}
