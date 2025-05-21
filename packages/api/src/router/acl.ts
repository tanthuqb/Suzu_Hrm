import { checkPermissionOrThrow } from "../libs";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const aclRouter = createTRPCRouter({
  getPermissions: protectedProcedure.query(async ({ ctx }) => {
    // await checkPermissionOrThrow(
    //   ctx,
    //   "acl",
    //   "getPermissions",
    //   "Không có quyền xem quyền truy cập",
    // );
    if (!ctx.session?.hrmUser.id) throw new Error("Unauthorized");

    const user = await ctx.db.query.HRMUser.findFirst({
      where: (u: { id: any }, { eq }: any) => eq(u.id, ctx.session?.hrmUser.id),
    });

    if (!user?.roleId) return [];

    const permissions = await ctx.db.query.Permission.findMany({
      where: (p: { roleId: any }, { eq }: any) => eq(p.roleId, user.roleId),
    });

    return permissions.map((p: { action: any }) => p.action);
  }),
});
