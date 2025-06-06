import { notFound, redirect } from "next/navigation";

import { isUUID } from "@acme/validators";

import { checkRole } from "~/actions/auth";
import SalarySlipSmartForm from "../../_components/SalarySlipForm";

interface SalaryProps {
  params: Promise<{ id?: string }>;
  searchParams: Promise<{ userId?: string }>;
}

export default async function SalaryPage({
  params,
  searchParams,
}: SalaryProps) {
  const { id: rawId } = await params;
  const { userId } = await searchParams;

  const { status, user, message } = await checkRole(["admin", "hr"]);
  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }
  if (rawId !== "create" && (!rawId || !isUUID(rawId))) {
    notFound();
  }
  const id = rawId !== "create" ? rawId : undefined;

  const fullName = `${user?.lastName} ${user?.firstName}`;

  return (
    <SalarySlipSmartForm
      id={id}
      userId={userId ?? user?.id!}
      name={fullName || "guest"}
    />
  );
}
