import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { Permission, Role } from "@acme/db/schema";

import { checkPermissionOrThrow, getAllTrpcActions } from "../libs/index";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const permissionRouter = createTRPCRouter({
  getAllActions: protectedProcedure.query(async ({ ctx }) => {
    await checkPermissionOrThrow(
      ctx,
      "permission",
      "getAllActions",
      "Không có quyền xoá vai trò",
    );
    try {
      const actions = getAllTrpcActions();
      return actions;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Lỗi khi lấy tất cả quyền",
      });
    }
  }),

  saveActions: protectedProcedure
    .input(
      z.object({
        roleId: z.string().uuid(),
        actions: z.array(
          z.object({
            module: z.string(),
            action: z.string(),
            type: z.enum(["mutation", "query"]),
            allow: z.boolean().optional().default(true),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "permission",
        "saveActions",
        "Không có quyền cập nhật vai trò",
      );
      const { roleId, actions } = input;

      try {
        await ctx.db.delete(Permission).where(eq(Permission.roleId, roleId));

        const inserted = await ctx.db
          .insert(Permission)
          .values(
            actions.map((a) => ({
              roleId,
              module: a.module,
              action: a.action,
              type: a.type,
              allow: a.allow ?? true,
            })),
          )
          .returning();

        return { message: "Lưu quyền thành công", data: inserted };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Lỗi khi lưu quyền",
          cause: error,
        });
      }
    }),

  getPermissionsByRoleId: protectedProcedure
    .input(z.object({ roleId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "permission",
        "getPermissionsByRoleId",
        "Không có quyền xem quyền theo role ID",
      );
      try {
        const permissions = await ctx.db
          .select({
            id: Permission.id,
            module: Permission.module,
            action: Permission.action,
            type: Permission.type,
            allow: Permission.allow,
            roleName: Role.name,
          })
          .from(Permission)
          .leftJoin(Role, eq(Permission.roleId, Role.id))
          .where(eq(Permission.roleId, input.roleId));

        if (permissions.length === 0) {
          return {
            role: "guest",
            permissions: [],
          };
        }

        const roleName = permissions[0]?.roleName;
        const permissionList = permissions.map((p) => ({
          module: p.module,
          action: p.action,
          type: p.type,
          allow: p.allow,
        }));

        return {
          role: roleName,
          permissions: permissionList,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Lỗi khi lấy quyền theo role ID",
          cause: error,
        });
      }
    }),

  checkPermission: protectedProcedure
    .input(
      z.object({
        roleId: z.string().uuid(),
        module: z.string(),
        action: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "permission",
        "checkPermission",
        "Không có quyền kiểm tra quyền",
      );
      try {
        const result = await ctx.db
          .select()
          .from(Permission)
          .where(
            and(
              eq(Permission.roleId, input.roleId),
              eq(Permission.module, input.module),
              eq(Permission.action, input.action),
            ),
          );

        if (result.length > 0 && result[0]?.allow !== undefined) {
          return result[0].allow;
        }

        return false;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Lỗi khi kiểm tra quyền",
          cause: error,
        });
      }
    }),
});
