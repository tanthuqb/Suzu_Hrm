import { redirect } from "next/navigation";

import { checkAuth } from "~/app/actions/auth";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import Permissions from "../_components/Permission-Client";

export default async function PermissionsPage() {
  const auth = await checkAuth();
  if (!auth.status || !auth.user) {
    redirect(
      `/login?message=${encodeURIComponent(auth.message || "Bạn cần đăng nhập.")}`,
    );
  }
  const { state: stateRole } = await ssrPrefetch(
    trpc.role.getAll.queryOptions(),
  );

  const { state: statePermission } = await ssrPrefetch(
    trpc.permission.getAllActions.queryOptions(),
  );

  const mergedState = {
    ...stateRole,
    ...statePermission,
  };

  return (
    <HydrateClient state={mergedState}>
      <div className="container py-10">
        <h1 className="mb-6 text-3xl font-bold">Permission Management</h1>
        <p className="mb-8 text-muted-foreground">
          Cấu hình quyền truy cập cho người dùng trong ứng dụng của bạn. Bạn có
          thể cấu hình quyền truy cập cho từng người dùng hoặc nhóm người dùng.
        </p>
        <Permissions />
      </div>
    </HydrateClient>
  );
}
