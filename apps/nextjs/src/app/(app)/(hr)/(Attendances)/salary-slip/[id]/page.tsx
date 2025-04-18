import { Suspense } from "react";
import { notFound } from "next/navigation";

import { checkAuth } from "~/app/actions/auth";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import SalarySlipSmartForm from "../../_components/SalarySlipForm";

export default async function Page(props: { params: { id?: string } }) {
  const { id } = props.params;

  const data = await checkAuth();

  if (!data || !id) notFound();

  await prefetch(trpc.salary?.getById.queryOptions({ id }));

  const fullName = `${data.lastName} ${data.firstName}`;

  return (
    <HydrateClient>
      <Suspense
        fallback={<div className="py-10 text-center">Đang tải biểu mẫu...</div>}
      >
        <SalarySlipSmartForm
          id={id}
          userId={data.id}
          name={fullName || "guest"}
        />
      </Suspense>
    </HydrateClient>
  );
}
