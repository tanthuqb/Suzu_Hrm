import { Suspense } from "react";
import { notFound } from "next/navigation";

import { isUUID } from "@acme/validators";

import { checkAuth } from "~/actions/auth";
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

  const data = await checkAuth();
  if (!data.status || !data.user) {
    notFound();
  }
  if (rawId !== "create" && (!rawId || !isUUID(rawId))) {
    notFound();
  }
  const id = rawId !== "create" ? rawId : undefined;

  const fullName = `${data.user.lastName} ${data.user.firstName}`;

  return (
    <Suspense
      fallback={<div className="py-10 text-center">Đang tải biểu mẫu...</div>}
    >
      <SalarySlipSmartForm
        id={id}
        userId={userId ?? data.user.id}
        name={fullName || "guest"}
      />
    </Suspense>
  );
}
