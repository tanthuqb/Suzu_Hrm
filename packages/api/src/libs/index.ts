import { TRPCError } from "@trpc/server";

import { appRouter } from "../root";

function extractProcedures(
  router: any,
  parentName = "",
): {
  module: string;
  action: string;
  type: "query" | "mutation" | "subscription";
}[] {
  const actions: {
    module: string;
    action: string;
    type: "query" | "mutation" | "subscription";
  }[] = [];

  for (const [moduleName, moduleRouter] of Object.entries<any>(router)) {
    try {
      if (moduleRouter && typeof moduleRouter === "object") {
        for (const [actionName, actionObj] of Object.entries<any>(
          moduleRouter,
        )) {
          if (actionObj?._def?.procedure) {
            const type = actionObj._def.type;
            if (
              type === "query" ||
              type === "mutation" ||
              type === "subscription"
            ) {
              actions.push({
                module: parentName ? `${parentName}.${moduleName}` : moduleName,
                action: actionName,
                type,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`Lỗi khi xử lý ${moduleName}:`, error);
    }
  }

  return actions;
}

export function getAllTrpcActions() {
  try {
    const actions = extractProcedures(appRouter._def.record);
    return actions;
  } catch (error) {
    console.error("Lỗi khi lấy tất cả các actions:", error);
    return [];
  }
}

/**
 * Hàm kiểm tra quyền dùng chung
 * @param ctx - Ngữ cảnh tRPC
 * @param module - Tên module cần kiểm tra
 * @param action - Hành động cần kiểm tra
 * @param errorMessage - Thông báo lỗi nếu không có quyền
 */
export async function checkPermissionOrThrow(
  ctx: any,
  module: string,
  action: string,
  errorMessage = "Không có quyền truy cập",
) {
  const hasPermission =
    ctx.permissions?.some(
      (p: any) =>
        p.module === module && p.action === action && p.allow === true,
    ) ?? false;

  if (!hasPermission) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: errorMessage,
    });
  }
}
