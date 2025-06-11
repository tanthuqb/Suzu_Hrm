import { redirect } from "next/navigation";

import { VALID_ROLES } from "@acme/db";

import { checkRole } from "~/actions/auth";
import { getUserById } from "~/libs/data/users";
import { ProfileContent } from "../_components/profile";

export default async function ProfilePage() {
  const { status, user, message } = await checkRole(VALID_ROLES);

  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  const userId = user?.id;
  const userData = await getUserById(userId!);

  return <ProfileContent userData={userData!} />;
}
