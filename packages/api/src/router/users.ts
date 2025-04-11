import type { TRPCRouterRecord } from "@trpc/server";
import { asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";

import type { IUser, UserRole, UserStatus } from "@acme/db";
import { HRMUser } from "@acme/db/schema";
import { adminAuthClient } from "@acme/supabase";
import { name } from "@acme/utils";

import { protectedProcedure } from "../trpc";

// Support both string ID directly and object with ID property
const idSchema = z.union([z.string(), z.object({ id: z.string() })]);

//filter email
const allowedDomains = ["@suzu.group", "@suzu.edu.vn"];
function isAllowedEmail(email: string) {
  return allowedDomains.some((domain) => email.endsWith(domain));
}

export const userRouter: TRPCRouterRecord = {
  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        name: z.string(),
        employeeCode: z.string(),
        email: z.string(),
        phone: z.string(),
        role: z.string(),
        status: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(HRMUser).values(input);
    }),
  all: protectedProcedure
    .input(
      z
        .object({
          page: z.number().default(1),
          pageSize: z.number().default(10),
          search: z.string().optional(),
          sortBy: z.string().optional().default(""),
          order: z.enum(["asc", "desc"]).optional().default("asc"),
        })
        .default({ page: 1, sortBy: "", pageSize: 10, order: "asc" }),
    )
    .query(async ({ input, ctx }) => {
      const { page, pageSize, search, sortBy, order } = input;
      const offset = (page - 1) * pageSize;

      const where = search
        ? or(
            ilike(HRMUser.firstName, `%${search}%`),
            ilike(HRMUser.lastName, `%${search}%`),
            ilike(HRMUser.email, `%${search}%`),
          )
        : undefined;

      const sortColumn = sortBy ? HRMUser.lastName : HRMUser.email;

      const [users, totalRes] = await Promise.all([
        ctx.db
          .select()
          .from(HRMUser)
          .where(where)
          .orderBy(order === "desc" ? desc(sortColumn) : asc(sortColumn))
          .limit(pageSize)
          .offset(offset)
          .then((rows) =>
            rows.map((row) => ({
              ...row,
              role: row.role as UserRole,
              status: row.status as UserStatus,
            })),
          ),

        ctx.db
          .select({ count: count(HRMUser.id).as("count") })
          .from(HRMUser)
          .where(where)
          .then((res) => Number(res[0]?.count ?? 0)),
      ]);

      return {
        users,
        total: totalRes,
      } satisfies { users: IUser[]; total: number };
    }),

  byId: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const id = typeof input === "string" ? input : input.id;
    return ctx.db.query.HRMUser.findFirst({
      where: eq(HRMUser.id, id),
    });
  }),
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const id = typeof input === "string" ? input : input.id;
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
    .mutation(async ({ ctx, input }) => {
      const supabase = adminAuthClient();
      if (input.length === 0) return [];
      const validUsers = input.filter((user) => isAllowedEmail(user.email));
      if (validUsers.length === 0) {
        throw new Error(
          "❌ Không có email nào hợp lệ (@suzu.group hoặc @suzu.edu.vn)",
        );
      }
      await ctx.db.delete(HRMUser);
      await ctx.db.insert(HRMUser).values(
        validUsers.map((u) => ({
          ...u,
          employeeCode: u.employeeCode ?? "",
          name: u.name ?? "",
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      );

      for (const user of validUsers) {
        const { error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: "Suzu@" + "842651973",
          email_confirm: true,
        });

        if (error) {
          console.error(
            `❌ Lỗi tạo Supabase Auth cho ${user.email}:`,
            error.message,
          );
        } else {
          console.log(`✅ Đã tạo Supabase Auth cho ${user.email}`);
        }
      }

      return {
        insertedCount: validUsers.length,
        ignoredCount: input.length - validUsers.length,
      };
    }),
};
