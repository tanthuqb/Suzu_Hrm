import { createTRPCRouter, protectedProcedure } from "../trpc";

/**
 * Department Router
 */
export const aclRouter = createTRPCRouter({
  getPermissions: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user.id) throw new Error("Unauthorized");

    const user = await ctx.db.query.HRMUser.findFirst({
      where: (u: { id: any }, { eq }: any) => eq(u.id, ctx.session?.user.id),
    });

    if (!user?.roleId) return [];

    const permissions = await ctx.db.query.Permission.findMany({
      where: (p: { roleId: any }, { eq }: any) => eq(p.roleId, user.roleId),
    });

    return permissions.map((p: { action: any }) => p.action);
  }),
});
