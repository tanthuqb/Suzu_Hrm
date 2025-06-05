import { UserStatusEnum } from "@acme/db";

import { trpc } from "~/trpc/server";

const year = new Date().getFullYear();

export const getCountUserActiveQuery =
  trpc.user.getCountUserByStatus.queryOptions({
    status: UserStatusEnum.ACTIVE,
    year,
  });

export const getCountUserSuspendedQuery =
  trpc.user.getCountUserByStatus.queryOptions({
    status: UserStatusEnum.SUSPENDED,
    year,
  });

export const getUserCountsByPositionQuery =
  trpc.user.getAllUserCountsByPosition.queryOptions();

export const getAuditLogsQuery = trpc.auditlog.getAll.queryOptions({
  page: 1,
  pageSize: 5,
});
