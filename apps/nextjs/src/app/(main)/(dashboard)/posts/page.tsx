import React from "react";
import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import { getAllPosts } from "~/libs/data/posts";
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

  const posts = await getAllPosts({
    page: 1,
    pageSize: 20,
    authorId: user?.id ?? undefined,
  });

  return (
    <div className="h-full w-full px-4 py-2">
      <PostsTable initialPosts={posts} />
    </div>
  );
};

export default Page;
