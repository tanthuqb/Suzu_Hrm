import { Suspense } from "react";
import { redirect } from "next/navigation";

import { UserStatusModal } from "~/app/_components/UserStatusModal";
import { checkAuth } from "~/app/actions/auth";
import { UserStatusModalProvider } from "~/app/context/UserStatusModalContext";
import { env } from "~/env";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import { UserTableSkeleton } from "../../_components/table-skeleton";
import { UserTable } from "./_components/user-table";

export default async function UsersPage() {
  const user = await checkAuth();
  if (!user) {
    redirect(
      `${env.NEXT_PUBLIC_APP_URL}/login?message=` +
        encodeURIComponent("Bạn cần đăng nhập."),
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
        <Suspense fallback={<UserTableSkeleton />}>
          <UserTable />
        </Suspense>
        <UserStatusModal />
      </UserStatusModalProvider>
    </HydrateClient>
  );
}
