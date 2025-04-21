import { Suspense } from "react";
import { notFound } from "next/navigation";

import { isUUID } from "@acme/validators";

import { checkAuth } from "~/app/actions/auth";
import { HydrateClient } from "~/trpc/server";
import SalarySlipSmartForm from "../../_components/SalarySlipForm";

export default async function SalaryPage(props: {
  params: { id?: string };
  searchParams: { userId?: string };
}) {
  const { params, searchParams } = await props;
  const rawId = params.id;
  const userId = searchParams.userId;

  const data = await checkAuth();

  if (!data) notFound();

  if (rawId !== "create" && (!rawId || !isUUID(rawId))) {
    notFound();
  }
  const id = rawId !== "create" ? rawId : undefined;

  const fullName = `${data.lastName} ${data.firstName}`;

  return (
    <HydrateClient>
      <Suspense
        fallback={<div className="py-10 text-center">Đang tải biểu mẫu...</div>}
      >
        <SalarySlipSmartForm
          id={id}
          userId={userId ?? data.id}
          name={fullName || "guest"}
        />
      </Suspense>
    </HydrateClient>
  );
}
