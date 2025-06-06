import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";

import { CreateSalarySlipSchema, HRMUser, SalarySlip } from "@acme/db/schema";

import { checkPermissionOrThrow } from "../libs";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const salaryRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateSalarySlipSchema)
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "salary",
        "create",
        "Không có quyền tạo phiếu lương",
      );
      const [inserted] = await ctx.db
        .insert(SalarySlip)
        .values(input)
        .returning();
      return inserted;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    await checkPermissionOrThrow(
      ctx,
      "salary",
      "getAll",
      "Không có quyền xem danh sách phiếu lương",
    );
    return await ctx.db.select().from(SalarySlip).orderBy(SalarySlip.createdAt);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "salary",
        "getById",
        "Không có quyền xem phiếu lương",
      );
      const { id } = input;
      const result = await ctx.db.query.SalarySlip.findFirst({
        where: (fields, { eq }) => eq(fields.id, id),
      });

      return result ?? null;
    }),

  getByUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "salary",
        "getByUser",
        "Không có quyền xem phiếu lương của người dùng",
      );
      return await ctx.db
        .select()
        .from(SalarySlip)
        .where(eq(SalarySlip.userId, input.userId));
    }),

  update: protectedProcedure
    .input(
      CreateSalarySlipSchema.extend({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "salary",
        "update",
        "Không có quyền cập nhật phiếu lương",
      );
      const { id, ...rest } = input;
      const [updated] = await ctx.db
        .update(SalarySlip)
        .set(rest)
        .where(eq(SalarySlip.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy phiếu lương",
        });
      }

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "salary",
        "delete",
        "Không có quyền xoá phiếu lương",
      );
      const deleted = await ctx.db
        .delete(SalarySlip)
        .where(eq(SalarySlip.id, input.id))
        .returning();

      if (!deleted.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy phiếu lương để xoá",
        });
      }

      return { message: "Xoá thành công", id: input.id };
    }),
  // // Lấy phiếu lương mới nhất của người dùng theo  danh sách  userIds
  getLatestSalaryByUserIds: protectedProcedure
    .input(
      z
        .object({
          page: z.number().default(1),
          pageSize: z.number().default(20),
          search: z.string().optional(),
          sortBy: z.string().optional(),
          order: z.enum(["asc", "desc"]).optional().default("asc"),
        })
        .default({
          page: 1,
          pageSize: 20,
          search: "",
          sortBy: "",
          order: "desc",
        }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, sortBy, order } = input;

      const where = search
        ? or(
            ilike(HRMUser.firstName, `%${search}%`),
            ilike(HRMUser.lastName, `%${search}%`),
            ilike(HRMUser.email, `%${search}%`),
          )
        : undefined;

      // Truy vấn userIds theo cùng phân trang
      const userIdsResult = await ctx.db
        .select({ id: HRMUser.id })
        .from(HRMUser)
        .where(where)
        .orderBy(
          sortBy === "firstName"
            ? order === "asc"
              ? HRMUser.firstName
              : desc(HRMUser.firstName)
            : order === "asc"
              ? HRMUser.email
              : desc(HRMUser.email),
        )
        .offset((page - 1) * pageSize)
        .limit(pageSize);

      const userIds = userIdsResult.map((u) => u.id);
      if (userIds.length === 0) return [];

      // Truy vấn phiếu lương mới nhất của từng user
      const subQuery = ctx.db
        .select({
          userId: SalarySlip.userId,
          latestCreatedAt: sql`MAX(${SalarySlip.createdAt})`.as("latest"),
        })
        .from(SalarySlip)
        .where(inArray(SalarySlip.userId, userIds))
        .groupBy(SalarySlip.userId)
        .as("latest_salaries");

      // Kết hợp với bảng SalarySlip để lấy thông tin chi tiết
      const results = await ctx.db
        .select()
        .from(SalarySlip)
        .innerJoin(
          subQuery,
          and(
            eq(SalarySlip.userId, subQuery.userId),
            eq(SalarySlip.createdAt, subQuery.latestCreatedAt),
          ),
        );

      return results.map((r) => ({
        ...r.salary_slips,
      }));
    }),
});
