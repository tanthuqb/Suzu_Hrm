import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { checkPermissionOrThrow, createTRPCContext } from "@acme/api";

import { getAllAttendances } from "~/libs/data/attendances";

export async function GET(req: NextRequest) {
  const headers = req.headers;
  const ctx = await createTRPCContext({ headers, session: null });
  try {
    await checkPermissionOrThrow(ctx, "attendance", "getAll");
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message ?? "Forbidden" },
      { status: 403 },
    );
  }
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 20);
  const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 20);
  const search = searchParams.get("search") ?? "";

  try {
    const data = await getAllAttendances({ page, pageSize, search });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách chấm công" },
      { status: 500 },
    );
  }
}
