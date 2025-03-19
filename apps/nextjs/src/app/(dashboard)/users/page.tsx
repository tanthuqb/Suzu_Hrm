import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "../../../trpc/server";
import { UserCardSkeleton } from "./_components/user-card";
import { UserList } from "./_components/user-list";

export default function UsersPage() {
  prefetch((trpc as any).user.all.queryOptions());

  return (
    <HydrateClient>
      <main className="container py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Users Management
          </h1>

          <div className="w-full max-w-2xl overflow-y-scroll">
            <Suspense
              fallback={
                <div className="flex w-full flex-col gap-4">
                  <UserCardSkeleton />
                  <UserCardSkeleton />
                  <UserCardSkeleton />
                </div>
              }
            >
              <UserList />
            </Suspense>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}