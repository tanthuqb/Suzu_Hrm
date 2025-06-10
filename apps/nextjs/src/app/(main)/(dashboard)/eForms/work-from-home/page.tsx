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
import { getLeaveBalanceByUserId } from "~/libs/data/leaverequest";
import WFHForm from "../../_components/eForms/wfh-form";

export default async function Page() {
  const { status, user, message } = await checkRole(VALID_ROLES);

  if (!status) {
    redirect(
      `/profile?message=${encodeURIComponent(message ?? "Bạn không có quyền truy cập.")}`,
    );
  }

  const leaveBalance = await getLeaveBalanceByUserId(
    user!.id,
    new Date().getFullYear(),
  );

  if (!leaveBalance) {
    redirect(
      `/profile?message=${encodeURIComponent(
        "Bạn không có số dư nghỉ phép để gửi đơn.",
      )}`,
    );
  }

  return (
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
        <WFHForm user={user!} leaveBalance={leaveBalance} />;
      </CardContent>
    </Card>
  );
}
