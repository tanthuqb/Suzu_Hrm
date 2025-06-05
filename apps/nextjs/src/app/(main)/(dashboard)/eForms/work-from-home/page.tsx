import React from "react";
import { redirect } from "next/navigation";

import { VALID_ROLES } from "@acme/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import { checkRole } from "~/actions/auth";
import WorkFromHomeForm from "~/app/(main)/(dashboard)/_components/eForms/form-work-from-home";
import { mergeDehydratedStates } from "~/libs";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";

export default async function Page() {
  const { status, user, message } = await checkRole(VALID_ROLES);

  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  const { state: stateDepartments } = await ssrPrefetch(
    trpc.department.getAll.queryOptions(),
  );
  const { state: statePositions } = await ssrPrefetch(
    trpc.position.getAll.queryOptions(),
  );
  const mergedState = mergeDehydratedStates([stateDepartments, statePositions]);

  return (
    <HydrateClient state={mergedState}>
      <Card className="w-full shadow-lg">
        <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-indigo-50 pb-6 text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Đơn xin làm việc tại nhà hoặc nghỉ phép
          </CardTitle>
          <CardDescription className="mt-2 text-muted-foreground">
            Vui lòng điền đầy đủ thông tin để gửi đơn xin làm việc tại nhà hoặc
            nghỉ phép. Chúng tôi sẽ xem xét và phản hồi trong thời gian sớm nhất
            thông qua email.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <WorkFromHomeForm user={user!} />
        </CardContent>
      </Card>
    </HydrateClient>
  );
}
