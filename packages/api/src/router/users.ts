import { asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { z } from "zod";

import type { SalarySlipWithUser, UserRole, UserStatus } from "@acme/db";
import type { SalarySlipRecord } from "@acme/db/schema";
import { HRMUser, SalarySlip } from "@acme/db/schema";
import { adminAuthClient } from "@acme/supabase";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const idSchema = z.union([z.string(), z.object({ id: z.string() })]);
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

      const joined = await ctx.db
        .select({
          user: HRMUser,
          salary: SalarySlip,
        })
        .from(HRMUser)
        .leftJoin(SalarySlip, eq(HRMUser.id, SalarySlip.userId))
        .where(where)
        .orderBy(
          order === "desc" ? desc(sortColumn) : asc(sortColumn),
          desc(SalarySlip.createdAt),
        );

      const userMap = new Map<
        string,
        SalarySlipWithUser & {
          latestSalarySlip?: SalarySlipRecord;
        }
      >();

      for (const { user, salary } of joined) {
        if (!userMap.has(user.id)) {
          userMap.set(user.id, {
            ...user,
            latestSalarySlip: salary ?? undefined,
          } as unknown as SalarySlipWithUser & {
            latestSalarySlip?: SalarySlipRecord;
          });
        }
      }

      const allUsers = Array.from(userMap.values());
      const users = allUsers.slice(offset, offset + pageSize);
      const total = allUsers.length;

      return {
        users,
        total,
      } satisfies {
        users: (SalarySlipWithUser & {
          latestSalarySlip?: SalarySlipRecord;
        })[];
        total: number;
      };
    }),

  byId: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const id = typeof input === "string" ? input : input.id;
    return ctx.db.query.HRMUser.findFirst({ where: eq(HRMUser.id, id) });
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
          authId = existingUser.id;
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
            phone: user.phone ?? "",
            role: user.role as UserRole,
            status: user.status as UserStatus,
            employeeCode: user.employeeCode || "",
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

      await ctx.db.insert(HRMUser).values(importedUsers);

      return {
        insertedCount: importedUsers.length,
        ignoredCount: input.length - importedUsers.length,
      };
    }),
});
