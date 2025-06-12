import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { checkPermissionOrThrow, createTRPCContext } from "@acme/api";

import { getPermissionsByRole } from "~/libs/data/permisions";

export async function GET(
  req: NextRequest,
  { params }: { params: { roleId: string } },
) {
  const headers = req.headers;
  const ctx = await createTRPCContext({ headers, session: null });

  try {
    await checkPermissionOrThrow(ctx, "permission", "getPermissionsByRoleId");
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message ?? "Forbidden" },
      { status: 403 },
    );
  }

  try {
    const result = await getPermissionsByRole(params.roleId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message ?? "Internal Server Error" },
      { status: 500 },
    );
  }
}
