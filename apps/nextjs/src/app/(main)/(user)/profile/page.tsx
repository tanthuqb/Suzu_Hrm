import { redirect } from "next/navigation";

import { VALID_ROLES } from "@acme/db";

import { checkRole } from "~/actions/auth";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import { ProfileContent } from "../_components/profile";

export default async function ProfilePage() {
  const { status, user, message } = await checkRole(VALID_ROLES);

  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  const { state } = await ssrPrefetch(
    trpc.user.byId.queryOptions({ id: user?.id! }),
  );

  return (
    <HydrateClient state={state}>
      <ProfileContent userId={user?.id!} />;
    </HydrateClient>
  );
}
