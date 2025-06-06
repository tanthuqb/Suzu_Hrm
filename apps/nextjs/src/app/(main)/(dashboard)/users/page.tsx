import { redirect } from "next/navigation";

import { checkRole } from "~/actions/auth";
import { UserStatusModal } from "~/components/Modals/UserStatusModal";
import { UserStatusModalProvider } from "~/context/UserStatusModalContext";
import { mergeDehydratedStates } from "~/libs";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import UserTableClient from "./_components/user-page-client";

// export const dynamic = "force-dynamic";
export default async function UsersPage() {
  const { status, message } = await checkRole(["admin", "hr"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }
  const input = {
    page: 1,
    pageSize: 20,
    search: "",
    sortBy: "email",
    order: "desc" as const,
  };

  const { state: stateUsers } = await ssrPrefetch(
    trpc.user.all.queryOptions(input),
  );

  const { state: stateRoles } = await ssrPrefetch(
    trpc.role.getAll.queryOptions(),
  );

  const { state: stateDepartments } = await ssrPrefetch(
    trpc.department.getAll.queryOptions(),
  );

  const { state: statePositions } = await ssrPrefetch(
    trpc.position.getAll.queryOptions(),
  );

  const { state: stateLatestSalaryByUserIds } = await ssrPrefetch(
    trpc.salary.getLatestSalaryByUserIds.queryOptions(),
  );

  const mergedState = mergeDehydratedStates([
    stateUsers,
    stateRoles,
    stateDepartments,
    statePositions,
    stateLatestSalaryByUserIds,
  ]);

  return (
    <HydrateClient state={mergedState}>
      <UserStatusModalProvider>
        <UserTableClient />
        <UserStatusModal />
      </UserStatusModalProvider>
    </HydrateClient>
  );
}
