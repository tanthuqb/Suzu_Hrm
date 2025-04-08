import { Suspense } from "react";
import { redirect } from "next/navigation";

import { UserStatusModal } from "~/app/_components/UserStatusModal";
import { checkAuth } from "~/app/actions/auth";
import { UserStatusModalProvider } from "~/app/context/UserStatusModalContext";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { UserTableSkeleton } from "./_components/table-skeleton";
import { UserTable } from "./_components/user-table";

export default async function UsersPage() {
  prefetch((trpc as any).user.all.queryOptions());

  const AuthUser = await checkAuth();
  if (!AuthUser) {
    redirect("/login?message=You must be logged in to access this page.");
  }

  if (AuthUser && AuthUser.role !== "admin") {
    redirect("/login?message=You do not have permission to access this page.");
  }
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
