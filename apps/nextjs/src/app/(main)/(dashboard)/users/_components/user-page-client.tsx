"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

import { UserTableSkeleton } from "~/components/Skeletons/table";

const UserTable = dynamic(
  () => import("./user-table").then((mod) => mod.UserTable),
  {
    ssr: false,
    loading: () => <UserTableSkeleton />,
  },
);

export default function UserTableClient() {
  return (
    <Suspense fallback={<UserTableSkeleton />}>
      <UserTable />
    </Suspense>
  );
}
