import { VALID_ROLES } from "@acme/db";

import { checkRole } from "~/actions/auth";
import DashboardClientPage from "./(dashboard)/_components/dashboards/page-client";

export default async function Page() {
  const { user } = await checkRole(VALID_ROLES);
  const role = user?.roleName.toLowerCase();

  return <DashboardClientPage role={role} />;
}
