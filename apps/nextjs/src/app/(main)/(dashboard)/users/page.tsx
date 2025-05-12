import { redirect } from "next/navigation";

import { checkAuth } from "~/actions/auth";
import { UserStatusModal } from "~/components/Modals/UserStatusModal";
import { UserStatusModalProvider } from "~/context/UserStatusModalContext";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import UserTableClient from "./_components/user-page-client";

export const dynamic = "force-dynamic";
export default async function UsersPage() {
  const auth = await checkAuth();
  if (!auth.status || !auth.user) {
    redirect(
      `/login?message=${encodeURIComponent(auth.message || "Bạn cần đăng nhập.")}`,
    );
  }
  const input = {
    page: 1,
    pageSize: 10,
    search: "",
    sortBy: "email",
    order: "desc" as const,
  };

  const { state } = await ssrPrefetch(trpc.user.all.queryOptions(input));

  return (
    <HydrateClient state={state}>
      <UserStatusModalProvider>
        <UserTableClient />
        <UserStatusModal />
      </UserStatusModalProvider>
    </HydrateClient>
  );
}
