import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { CreateNoteSchema, Notes } from "@acme/db/schema";

import { checkPermissionOrThrow } from "../libs";
import { protectedProcedure } from "../trpc";

export const noteRouter = {
  getAllNotes: protectedProcedure.query(async ({ ctx }) => {
    await checkPermissionOrThrow(
      ctx,
      "notes",
      "getAll",
      "Không có quyền xem tất cả ghi chú",
    );
    return await ctx.db.select().from(Notes).orderBy(desc(Notes.createdAt));
  }),
  getNoteById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "notes",
        "getById",
        "Không có quyền xem ghi chú này",
      );
      const { id } = input;
      const result = await ctx.db
        .select()
        .from(Notes)
        .where(eq(Notes.id, id))
        .limit(1)
        .execute();
      if (!result.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy ghi chú",
        });
      }
      return result[0];
    }),
  createNote: protectedProcedure
    .input(CreateNoteSchema)
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "notes",
        "create",
        "Không có quyền tạo ghi chú",
      );
      const [inserted] = await ctx.db.insert(Notes).values(input).returning();
      return inserted;
    }),
  updateNote: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          title: z.string().min(1, "Tiêu đề không được để trống"),
          content: z.string().optional(),
          tags: z.array(z.string()).optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "notes",
        "update",
        "Không có quyền cập nhật ghi chú",
      );
      const { id, data } = input;
      const [updated] = await ctx.db
        .update(Notes)
        .set(data)
        .where(eq(Notes.id, id))
        .returning();
      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy ghi chú để cập nhật",
        });
      }
      return updated;
    }),
  deleteNote: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "notes",
        "delete",
        "Không có quyền xóa ghi chú",
      );
      const { id } = input;
      const result = await ctx.db
        .delete(Notes)
        .where(eq(Notes.id, id))
        .returning();
      if (!result.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy ghi chú để xóa",
        });
      }
      return result[0];
    }),
  getNoteCount: protectedProcedure.query(async ({ ctx }) => {
    await checkPermissionOrThrow(
      ctx,
      "notes",
      "getCount",
      "Không có quyền xem số lượng ghi chú",
    );
    const countResult = await ctx.db
      .select({ count: count() })
      .from(Notes)
      .execute();
    return countResult[0]?.count ?? 0;
  }),
} satisfies TRPCRouterRecord;
