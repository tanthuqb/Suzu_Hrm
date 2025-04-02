import { Suspense } from "react";

import { UserStatusModal } from "~/app/_components/UserStatusModal";
import { checkAuth } from "~/app/actions/auth";
import { UserStatusModalProvider } from "~/app/context/UserStatusModalContext";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { UserTableSkeleton } from "./_components/table-skeleton";
import { UserTable } from "./_components/user-table";

export default async function UsersPage() {
  prefetch((trpc as any).user.all.queryOptions());

  const AuthUser = await checkAuth();

  if (!AuthUser || AuthUser.role !== "admin") return null;

  return (
    <HydrateClient>
      <UserStatusModalProvider>
        <Suspense fallback={<UserTableSkeleton />}>
          <UserTable />
        </Suspense>
        <UserStatusModal />
      </UserStatusModalProvider>
    </HydrateClient>
  );
}
