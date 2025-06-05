import React from "react";
import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import PostsTable from "../_components/posts/posts-table";

const Page = async () => {
  const { status, user, message } = await checkRole([
    "admin",
    "author",
    "user",
  ]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  const { state } = await ssrPrefetch(
    trpc.posts.getAllPosts.queryOptions({
      page: 1,
      pageSize: 20,
      authorId: user?.id ?? undefined,
    }),
  );

  return (
    <HydrateClient state={state}>
      <div className="h-full w-full px-4 py-2">
        <PostsTable />
      </div>
    </HydrateClient>
  );
};

export default Page;
