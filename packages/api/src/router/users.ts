import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";

import type { FullHrmUser, UserListItem } from "@acme/db";
import { UserStatusEnum } from "@acme/db";
import {
  Department,
  HRMUser,
  Position,
  Role,
  SalarySlip,
} from "@acme/db/schema";
import { adminAuthClient } from "@acme/supabase";

import type { ImportUsersResult } from "../types/index";
import { checkPermissionOrThrow } from "../libs";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const allowedDomains = ["@suzu.group", "@suzu.edu.vn"];
function isAllowedEmail(email: string) {
  return allowedDomains.some((domain) => email.endsWith(domain));
}

export const userRouter = createTRPCRouter({
  all: protectedProcedure
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
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "user",
        "all",
        "Không có quyền cập nhật người dùng",
      );
      // phân trang, tìm kiếm, sắp xếp
      const { page, pageSize, search, sortBy, order } = input;
      const offset = (page - 1) * pageSize;

      // nếu sortBy không có giá trị thì mặc định sắp xếp theo email
      const whereClause = search
        ? or(
            ilike(HRMUser.firstName, `%${search}%`),
            ilike(HRMUser.lastName, `%${search}%`),
            ilike(HRMUser.email, `%${search}%`),
          )
        : undefined;

      // đếm tổng số người dùng
      const [countResult] = await ctx.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(HRMUser)
        .where(whereClause)
        .execute();

      const total = countResult?.count ?? 0;

      const sortColumn =
        sortBy === "firstName"
          ? HRMUser.firstName
          : sortBy === "lastName"
            ? HRMUser.lastName
            : HRMUser.email;
      // lấy danh sách người dùng với các thông tin liên quan
      const users = await ctx.db
        .select({
          id: HRMUser.id,
          email: HRMUser.email,
          firstName: HRMUser.firstName,
          lastName: HRMUser.lastName,
          status: HRMUser.status,
          role: {
            id: Role.id,
            name: Role.name,
          },
          department: {
            id: Department.id,
            name: Department.name,
          },
          position: {
            id: Position.id,
            name: Position.name,
          },
        })
        .from(HRMUser)
        .leftJoin(Role, eq(HRMUser.roleId, Role.id))
        .leftJoin(Department, eq(HRMUser.departmentId, Department.id))
        .leftJoin(Position, eq(HRMUser.positionId, Position.id))
        .where(whereClause)
        .orderBy(order === "desc" ? desc(sortColumn) : asc(sortColumn))
        .limit(pageSize)
        .offset(offset)
        .execute();

      return {
        users: users.map((u) => ({
          ...u,
          status: u.status as UserStatusEnum,
        })),
        total,
      } satisfies {
        users: UserListItem[];
        total: number;
      };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await checkPermissionOrThrow(
        ctx,
        "user",
        "byId",
        "Không có quyền lấy thông tin người dùng",
      );

      const { id } = input;

      // lấy thông tin người dùng và lương mới nhất
      const latestSalarySub = ctx.db
        .select({
          userId: SalarySlip.userId,
          latestCreatedAt: sql`MAX(${SalarySlip.createdAt})`.as("latest"),
        })
        .from(SalarySlip)
        .groupBy(SalarySlip.userId)
        .as("latest_salary");
      // join với bảng người dùng và các bảng liên quan
      const result = await ctx.db
        .select({
          user: HRMUser,
          salary: SalarySlip,
          role: Role,
          department: Department,
          position: Position,
        })
        .from(HRMUser)
        .leftJoin(latestSalarySub, eq(HRMUser.id, latestSalarySub.userId))
        .leftJoin(
          SalarySlip,
          and(
            eq(SalarySlip.userId, latestSalarySub.userId),
            eq(SalarySlip.createdAt, latestSalarySub.latestCreatedAt),
          ),
        )
        .leftJoin(Role, eq(HRMUser.roleId, Role.id))
        .leftJoin(Department, eq(HRMUser.departmentId, Department.id))
        .leftJoin(Position, eq(HRMUser.positionId, Position.id))
        .where(eq(HRMUser.id, id))
        .limit(1)
        .execute();

      if (result.length === 0 || !result[0]?.user) return null;

      const { user, salary, role, department, position } = result[0];

      return {
        ...user,
        status: user.status as UserStatusEnum,
        latestSalarySlip: salary ?? undefined,
        role: role?.id ? { id: role.id, name: role.name } : undefined,
        departments: department?.id
          ? { id: department.id, name: department.name }
          : undefined,
        positions: position?.id
          ? { id: position.id, name: position.name }
          : undefined,
      } satisfies FullHrmUser;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        roleId: z.string().optional(),
        status: z.enum(["active", "suspended"]).optional(),
        employeeCode: z.string().optional(),
        departmentId: z.string().optional(),
        positionId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermissionOrThrow(
        ctx,
        "user",
        "update",
        "Không có quyền cập nhật người dùng",
      );
      const { id, ...rest } = input;
      const user = await ctx.db.query.HRMUser.findFirst({
        where: eq(HRMUser.id, id),
      });
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      if (rest.email && !isAllowedEmail(rest.email)) {
        throw new Error(
          "❌ Email không hợp lệ. Chỉ cho phép email với miền @suzu.group hoặc @suzu.edu.vn",
        );
      }
      return ctx.db.update(HRMUser).set(rest).where(eq(HRMUser.id, id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await checkPermissionOrThrow(
        ctx,
        "user",
        "delete",
        "Không có quyền xóa người dùng",
      );
      const { id } = input;
      return ctx.db.delete(HRMUser).where(eq(HRMUser.id, id));
    }),

  imports: protectedProcedure
    .input(
      z.array(
        z.object({
          firstName: z.string(),
          lastName: z.string(),
          name: z.string().optional(),
          email: z.string().email(),
          employeeCode: z.string().optional(),
          phone: z.string(),
          role: z.string(),
          status: z.string(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }): Promise<ImportUsersResult> => {
      await checkPermissionOrThrow(
        ctx,
        "user",
        "imports",
        "Không có quyền import người dùng",
      );
      const supabase = adminAuthClient();

      if (input.length === 0)
        return {
          insertedCount: 0,
          ignoredCount: 0,
        };

      const validUsers = input.filter((user) => isAllowedEmail(user.email));
      if (validUsers.length === 0) {
        throw new Error(
          "❌ Không có email nào hợp lệ (@suzu.group hoặc @suzu.edu.vn)",
        );
      }

      const importedUsers: (typeof HRMUser.$inferInsert)[] = [];

      for (const user of validUsers) {
        let authId: string | undefined;
        const { data: existingUser, error: selectError } = await supabase
          .from("auth.users")
          .select("id, email")
          .eq("email", user.email)
          .maybeSingle();

        if (selectError) {
          console.error(
            `❌ Lỗi truy vấn auth.users cho ${user.email}:`,
            selectError.message,
          );
          continue;
        }
        if (existingUser?.id) {
          authId = existingUser.id as string;
        } else {
          const password =
            "Suzu@" + Math.floor(100000 + Math.random() * 900000);
          const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password,
            email_confirm: true,
          });

          if (error || !data.user.id) {
            console.error(
              `❌ Lỗi tạo Supabase Auth cho ${user.email}:`,
              error?.message,
            );
            continue;
          }

          authId = data.user.id;

          console.log(`✅ Đã tạo Auth user: ${user.email}`);
        }

        if (authId) {
          importedUsers.push({
            id: authId,
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.name ?? `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone,
            roleId: "",
            status: user.status as UserStatusEnum,
            employeeCode: user.employeeCode ?? "",
            departmentId: "",
            positionId: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      await ctx.db.delete(HRMUser).where(
        inArray(
          HRMUser.email,
          importedUsers.map((u) => u.email),
        ),
      );

      if (importedUsers.length > 0) {
        console.warn("⚠️ Không có người dùng nào được import vào DB.");
        await ctx.db.insert(HRMUser).values(importedUsers);
      }

      return {
        insertedCount: importedUsers.length,
        ignoredCount: input.length - importedUsers.length,
      };
    }),

  getAllUserSimple: protectedProcedure.query(async ({ ctx }) => {
    await checkPermissionOrThrow(
      ctx,
      "user",
      "getAllUserSimple",
      "Không có quyền lấy danh sách người dùng đơn giản",
    );
    return ctx.db.query.HRMUser.findMany({
      where: (fields, { eq }) => eq(fields.status, "active"),
    });
  }),

  getAllUserByDepartmentId: protectedProcedure
    .input(z.object({ departmentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { departmentId } = input;
      return ctx.db.query.HRMUser.findMany({
        where: (fields, { eq }) =>
          eq(fields.departmentId, departmentId) && eq(fields.status, "active"),
      });
    }),
  updateAvatar: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        avatar: z.string().url("avatarUrl phải là một URL hợp lệ"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, avatar } = input;
      const user = await ctx.db.query.HRMUser.findFirst({
        where: eq(HRMUser.id, id),
      });
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      return ctx.db.update(HRMUser).set({ avatar }).where(eq(HRMUser.id, id));
    }),
  getCountUserByStatus: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(UserStatusEnum),
        year: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { status, year } = input;

        const results = await ctx.db
          .select({
            month: sql<number>`EXTRACT(MONTH FROM ${HRMUser.createdAt})`,
            count: sql<number>`COUNT(*)`,
          })
          .from(HRMUser)
          .where(
            year
              ? and(
                  eq(HRMUser.status, status),
                  eq(
                    sql<number>`EXTRACT(YEAR FROM ${HRMUser.createdAt})`,
                    year,
                  ),
                )
              : eq(HRMUser.status, status),
          )
          .groupBy(sql<number>`EXTRACT(MONTH FROM ${HRMUser.createdAt})`)
          .orderBy(sql<number>`EXTRACT(MONTH FROM ${HRMUser.createdAt})`)
          .execute();

        return results;
      } catch (error) {
        console.error("Error in getCountUserByStatus:", error);
        throw new Error("Failed to fetch user counts.");
      }
    }),
  getAllUserCountsByPosition: protectedProcedure.query(async ({ ctx }) => {
    try {
      const results = await ctx.db
        .select({
          positionId: HRMUser.positionId,
          positionName: Position.name,
          count: sql<number>`COUNT(*)`,
        })
        .from(HRMUser)
        .leftJoin(Position, eq(HRMUser.positionId, Position.id))
        .where(eq(HRMUser.status, "active"))
        .groupBy(HRMUser.positionId, Position.name)
        .execute();

      return results.map((result) => ({
        positionId: result.positionId,
        positionName: result.positionName,
        count: result.count,
      }));
    } catch (error) {
      console.error("Error in getAllUserCountsByPosition:", error);
      throw new Error("Failed to fetch user counts by position.");
    }
  }),
});
