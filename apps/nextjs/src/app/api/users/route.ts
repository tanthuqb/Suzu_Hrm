import { NextResponse } from "next/server";

import { checkPermissionOrThrow, createTRPCContext } from "@acme/api";

import { getUserListUncached } from "~/libs/data/users";

export async function GET(req: Request) {
  const headers = req.headers;
  const ctx = await createTRPCContext({ headers, session: null });

  try {
    await checkPermissionOrThrow(ctx, "user", "all");
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message ?? "Forbidden" },
      { status: 403 },
    );
  }
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const search = searchParams.get("search") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "email";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";

  const data = await getUserListUncached({
    page,
    pageSize,
    search,
    sortBy,
    order,
  });

  return NextResponse.json(data);
}
