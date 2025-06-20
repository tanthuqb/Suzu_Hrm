import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, sql } from "@acme/db";
import { AuditLogs, HRMUser } from "@acme/db/schema";

import { checkPermissionOrThrow } from "../libs";
import { protectedProcedure } from "../trpc";

export const auditlogRouter = {
  getAll: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid().optional(),
        action: z.string().optional(),
        entity: z.string().optional(),
        request: z.string().optional(),
        response: z.string().optional(),
        payload: z.string().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        email: z.string().email().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // await checkPermissionOrThrow(
      //   ctx,
      //   "auditlog",
      //   "getAll",
      //   "Không có quyền xem quyền truy cập",
      // );
      const page = input.page ?? 1;
      const pageSize = input.pageSize ?? 20;
      const offset = (page - 1) * pageSize;
      const query = ctx.db
        .select()
        .from(AuditLogs)
        .leftJoin(HRMUser, eq(AuditLogs.userId, HRMUser.id));
      const whereConditions = [];
      if (input.email) {
        whereConditions.push(eq(HRMUser.email, input.email));
      }
      if (input.action) {
        whereConditions.push(eq(AuditLogs.action, input.action));
      }
      if (input.entity) {
        whereConditions.push(eq(AuditLogs.entity, input.entity));
      }
      if (input.request) {
        whereConditions.push(eq(AuditLogs.request, input.request));
      }
      if (input.response) {
        whereConditions.push(eq(AuditLogs.response, input.response));
      }
      if (input.payload) {
        whereConditions.push(eq(AuditLogs.payload, input.payload));
      }

      if (whereConditions.length > 0) {
        query.where(and(...whereConditions));
      }
      const countQuery = ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(AuditLogs)
        .leftJoin(HRMUser, eq(AuditLogs.userId, HRMUser.id));

      if (whereConditions.length > 0) {
        countQuery.where(and(...whereConditions));
      }

      const [countResult] = await countQuery.execute();
      const totalCount = countResult?.count ?? 0;

      const logs = await query
        .orderBy(desc(AuditLogs.createdAt))
        .limit(pageSize)
        .offset(offset)
        .execute();

      const formattedLogs = logs.map((row) => ({
        ...row.audit_logs,
        user: row.users,
      }));

      return {
        logs: formattedLogs,
        pagination: {
          total: totalCount,
          page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      };
    }),
} satisfies TRPCRouterRecord;
