import type { DBUser } from "@acme/db";
import { postStatusValues } from "@acme/db";
import { createServerClient } from "@acme/supabase";

import { logger } from "../logger";

export interface Post {
  id: string;
  title: string;
  author: DBUser;
  authorId: {
    id: string;
    name: string;
  };
  tags: {
    id: string;
    name: string;
    slug?: string;
    description?: string;
  }[];
  post_tags: {
    id: string;
    postId: string;
    tagId: string;
    tag: {
      id: string;
      name: string;
      slug?: string;
      description?: string;
    };
  }[];
  notes: {
    id: string;
    content: string;
    authorId: {
      id: string;
      name: string;
    };
    created_at: Date;
  }[];
  content: string;
  status: "draft" | "pending" | "published" | "approved" | "rejected";
  attachments: string[];
  created_at: Date;
  updated_at: Date;
}

export interface GetAllPostsOptions {
  page?: number;
  pageSize?: number;
  status?: (typeof postStatusValues)[number];
  search?: string;
  authorId?: string;
}

export interface GetAllPostsResponse {
  posts: Post[];
  pagination: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export async function getAllPosts({
  page = 1,
  pageSize = 10,
  status = postStatusValues[0],
  search,
  authorId,
}: GetAllPostsOptions): Promise<GetAllPostsResponse> {
  const supabase = await createServerClient();
  const offset = (page - 1) * pageSize;

  let baseQuery = supabase
    .from("posts")
    .select(
      `
      *,
      author:users(*),
      post_tags(*, tag:tags(*))
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (search) {
    baseQuery = baseQuery.ilike("title", `%${search}%`);
  }

  if (authorId) {
    baseQuery = baseQuery.eq("author_id", authorId);
  }

  if (status) {
    baseQuery = baseQuery.eq("status", status);
  }

  const { data, count: totalCount, error } = await baseQuery;

  logger.error("Error fetching posts", {
    page,
    pageSize,
    status,
    search,
    authorId,
    error,
  });
  if (error) throw new Error(error.message);

  const processedPosts = (data ?? []).map((post) => {
    const tags = post.post_tags?.map((pt: any) => pt.tag).filter(Boolean) ?? [];
    return {
      ...post,
      tags,
    };
  });

  return {
    posts: processedPosts,
    pagination: {
      totalCount: totalCount ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((totalCount ?? 0) / pageSize),
    },
  };
}
