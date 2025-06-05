import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, like } from "drizzle-orm";
import { z } from "zod";

import { postStatusValues } from "@acme/db";
import {
  CreatePostSchema,
  HRMUser,
  Posts,
  PostTags,
  Tags,
} from "@acme/db/schema";

import { checkPermissionOrThrow } from "../libs";
import { protectedProcedure } from "../trpc";

export const postsRouter = {
  getAllPosts: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        status: z
          .enum(postStatusValues)
          .optional()
          .default(postStatusValues[2]),
        search: z.string().optional(),
        authorId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await checkPermissionOrThrow(
        ctx,
        "posts",
        "getAllPosts",
        "Không có quyền xem tất cả bài viết",
      );
      const query = ctx.db
        .select()
        .from(Posts)
        .leftJoin(HRMUser, eq(Posts.authorId, HRMUser.id))
        .leftJoin(PostTags, eq(PostTags.postId, Posts.id))
        .leftJoin(Tags, eq(PostTags.tagId, Tags.id));

      const countQuery = ctx.db.select({ count: count() }).from(Posts);

      if (input.search) {
        query.where(like(Posts.title, `%${input.search}%`));
      }

      if (input.authorId) {
        query.where(eq(Posts.authorId, input.authorId));
      }

      if (input.search) {
        countQuery.where(like(Posts.title, `%${input.search}%`));
      }

      if (input.authorId) {
        countQuery.where(eq(Posts.authorId, input.authorId));
      }

      const [totalCount] = await countQuery;

      const offset = (input.page - 1) * input.pageSize;
      query.orderBy(desc(Posts.createdAt)).limit(input.pageSize).offset(offset);

      const posts = await query;

      const processedPosts = [];
      const postMap = new Map();

      for (const row of posts) {
        const postId = row.posts.id;

        if (!postMap.has(postId)) {
          postMap.set(postId, {
            ...row.posts,
            author: row.users,
            tags: [],
            post_tags: [],
          });
        }

        const post = postMap.get(postId);

        if (
          row.tags &&
          row.tags.id &&
          !post.tags.some((t: any) => t.id === row.tags!.id)
        ) {
          post.tags.push(row.tags);
        }

        if (
          row.post_tags &&
          row.post_tags.id &&
          !post.post_tags.some((pt: any) => pt.id === row.post_tags!.id)
        ) {
          post.post_tags.push(row.post_tags);
        }
      }

      return {
        posts: Array.from(postMap.values()),
        pagination: {
          totalCount: totalCount?.count ?? 0,
          page: input.page,
          pageSize: input.pageSize,
          totalPages: Math.ceil((totalCount?.count ?? 0) / input.pageSize),
        },
      };
    }),
  getPostsByAuthor: protectedProcedure
    .input(z.object({ authorId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "posts",
        "getPostsByAuthor",
        "Không có quyền xem bài viết của tác giả này",
      );
      const { authorId } = input;
      return await ctx.db
        .select()
        .from(Posts)
        .where(eq(Posts.authorId, authorId))
        .orderBy(desc(Posts.createdAt));
    }),
  getPostById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "posts",
        "getPostById",
        "Không có quyền xem bài viết này",
      );
      const { id } = input;
      const result = await ctx.db
        .select()
        .from(Posts)
        .leftJoin(HRMUser, eq(Posts.authorId, HRMUser.id))
        .leftJoin(PostTags, eq(PostTags.postId, Posts.id))
        .leftJoin(Tags, eq(PostTags.tagId, Tags.id))
        .where(eq(Posts.id, id))
        .limit(1)
        .execute();
      if (!result.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy bài viết",
        });
      }
      return result[0];
    }),
  createPost: protectedProcedure
    .input(CreatePostSchema)
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "posts",
        "createPost",
        "Không có quyền tạo bài viết",
      );
      const { title, content, authorId, status, attachments } = input;

      const post = await ctx.db
        .insert(Posts)
        .values({
          title,
          content,
          authorId,
          status,
          attachments,
        })
        .returning();

      if (!post.length) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Không thể tạo bài viết",
        });
      }
      return post[0];
    }),
  updatePost: protectedProcedure
    .input(
      CreatePostSchema.extend({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "posts",
        "updatePost",
        "Không có quyền cập nhật bài viết",
      );
      const { id, title, content, authorId, status, attachments } = input;
      const post = await ctx.db
        .update(Posts)
        .set({
          title,
          content,
          authorId,
          status,
          attachments,
        })
        .where(eq(Posts.id, id))
        .returning();
      if (!post.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy bài viết để cập nhật",
        });
      }
      return post[0];
    }),
  deletePost: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "posts",
        "deletePost",
        "Không có quyền xóa bài viết",
      );
      const { id } = input;
      const post = await ctx.db
        .delete(Posts)
        .where(eq(Posts.id, id))
        .returning();
      if (!post.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy bài viết để xóa",
        });
      }
      return post[0];
    }),
  getPostTags: protectedProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "posts",
        "getPostTags",
        "Không có quyền xem tags của bài viết này",
      );
      const { postId } = input;
      return await ctx.db
        .select()
        .from(PostTags)
        .leftJoin(Tags, eq(PostTags.tagId, Tags.id))
        .where(eq(PostTags.postId, postId));
    }),
  addPostTag: protectedProcedure
    .input(z.object({ postId: z.string().uuid(), tagId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "posts",
        "addPostTag",
        "Không có quyền thêm tag vào bài viết",
      );
      const { postId, tagId } = input;
      const existingTag = await ctx.db
        .select()
        .from(PostTags)
        .where(and(eq(PostTags.postId, postId), eq(PostTags.tagId, tagId)))
        .execute();
      if (existingTag.length) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tag đã tồn tại trong bài viết này",
        });
      }
      const postTag = await ctx.db
        .insert(PostTags)
        .values({ postId, tagId })
        .returning();
      return postTag[0];
    }),
  removePostTag: protectedProcedure
    .input(z.object({ postId: z.string().uuid(), tagId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "posts",
        "removePostTag",
        "Không có quyền xóa tag khỏi bài viết",
      );
      const { postId, tagId } = input;
      const postTag = await ctx.db
        .delete(PostTags)
        .where(and(eq(PostTags.postId, postId), eq(PostTags.tagId, tagId)))
        .returning();
      if (!postTag.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy tag để xóa",
        });
      }
      return postTag[0];
    }),
  getAllTags: protectedProcedure.query(async ({ ctx }) => {
    await checkPermissionOrThrow(
      ctx,
      "posts",
      "getAllTags",
      "Không có quyền xem tất cả tags",
    );
    return await ctx.db.select().from(Tags).orderBy(desc(Tags.createdAt));
  }),
  createTag: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "posts",
        "createTag",
        "Không có quyền tạo tag",
      );
      const { name } = input;
      const existingTag = await ctx.db
        .select()
        .from(Tags)
        .where(eq(Tags.name, name))
        .execute();
      if (existingTag.length) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tag đã tồn tại",
        });
      }
      const tag = await ctx.db
        .insert(Tags)
        .values({ name, slug: name.toLowerCase().replace(/\s+/g, "-") })
        .returning();
      return tag[0];
    }),
  updateTag: protectedProcedure
    .input(z.object({ id: z.string().uuid(), name: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "posts",
        "updateTag",
        "Không có quyền cập nhật tag",
      );
      const { id, name } = input;
      const existingTag = await ctx.db
        .select()
        .from(Tags)
        .where(eq(Tags.id, id))
        .execute();
      if (!existingTag.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy tag để cập nhật",
        });
      }
      const updatedTag = await ctx.db
        .update(Tags)
        .set({ name })
        .where(eq(Tags.id, id))
        .returning();
      return updatedTag[0];
    }),
  deleteTag: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await checkPermissionOrThrow(
        ctx,
        "posts",
        "deleteTag",
        "Không có quyền xóa tag",
      );
      const { id } = input;
      const existingTag = await ctx.db
        .select()
        .from(Tags)
        .where(eq(Tags.id, id))
        .execute();
      if (!existingTag.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy tag để xóa",
        });
      }
      const deletedTag = await ctx.db
        .delete(Tags)
        .where(eq(Tags.id, id))
        .returning();
      return deletedTag[0];
    }),
  getPostCount: protectedProcedure.query(async ({ ctx }) => {
    await checkPermissionOrThrow(
      ctx,
      "posts",
      "getPostCount",
      "Không có quyền xem số lượng bài viết",
    );

    const result = await ctx.db
      .select({ count: count(Posts.id) })
      .from(Posts)
      .execute();

    return result[0]?.count ?? 0;
  }),
} satisfies TRPCRouterRecord;
