import { Suspense } from "react";
import { redirect } from "next/navigation";

import { UserStatusModal } from "~/app/_components/UserStatusModal";
import { checkAuth } from "~/app/actions/auth";
import { UserStatusModalProvider } from "~/app/context/UserStatusModalContext";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { UserTableSkeleton } from "./_components/table-skeleton";
import { UserTable } from "./_components/user-table";

export default async function UsersPage() {
  const AuthUser = await checkAuth();
  if (!AuthUser) {
    redirect("/login?message=You must be logged in to access this page.");
  }

  if (AuthUser && AuthUser.role !== "admin") {
    redirect("/login?message=You do not have permission to access this page.");
  }

  const input = {
    page: 1,
    pageSize: 10,
    search: "",
    sortBy: "email",
    order: "desc",
  };

  await prefetch(trpc.user?.all.queryOptions(input));
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
