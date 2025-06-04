import React from "react";
import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import PostClientPage from "./../_components/posts/content-client";

const Page = async () => {
  const { status, user, message } = await checkRole(["admin", "author"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  return (
    <div className="h-full w-full px-4 py-2">
      <PostClientPage userId={user?.id!} />
    </div>
  );
};

export default Page;
