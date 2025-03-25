import { Suspense } from "react";

import { checkAuth } from "~/app/actions/auth";
import { UserStatusModalProvider } from "~/app/context/UserStatusModalContext";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { UserList } from "./_components/user-list";

export default async function UsersPage() {
  prefetch((trpc as any).user.all.queryOptions());

  const AuthUser = await checkAuth();

  return (
    <UserStatusModalProvider>
      <HydrateClient>
        <main className="container py-16">
          <div className="flex flex-col items-center justify-center gap-4">
            {AuthUser && AuthUser.role === "admin" ? (
              <div className="w-full max-w-2xl overflow-y-scroll">
                <Suspense
                  fallback={<div className="flex w-full flex-col gap-4"></div>}
                >
                  <UserList />
                </Suspense>
              </div>
            ) : null}
          </div>
        </main>
      </HydrateClient>
    </UserStatusModalProvider>
  );
}
