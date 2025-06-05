import React from "react";
import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import PostClientPage from "../../_components/posts/content-client";

interface PostPageProps {
  params: Promise<{ id?: string }>;
}

const Page = async ({ params }: PostPageProps) => {
  const { id } = await params;

  const { status, user, message } = await checkRole(["admin", "author"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  return (
    <div className="h-full w-full px-4 py-2">
      <PostClientPage userId={user?.id!} postId={id} />
    </div>
  );
};

export default Page;
