import { redirect } from "next/navigation";

import { VALID_ROLES } from "@acme/db";

import { checkRole } from "~/actions/auth";
import { getMonthRange } from "~/libs";
import { countAttendanceByStatus } from "~/libs/data/attendances";
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
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const { fromDate, toDate } = getMonthRange(year, month);
  const userLeaveBalance = await countAttendanceByStatus({
    userId,
    fromDate,
    toDate,
  });
  console.log("userLeaveBalance", userLeaveBalance);
  return (
    <ProfileContent userData={userData!} userLeaveBalance={userLeaveBalance} />
  );
}
