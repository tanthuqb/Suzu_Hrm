import { LeaveRequests } from "@acme/db/schema";

import { aclRouter } from "./router/acl";
import { attendanceRouter } from "./router/attendance";
import { authRouter } from "./router/auth";
import { departmentRouter } from "./router/department";
import { hrRouter } from "./router/hr";
import { permissionRouter } from "./router/permission";
import { roleRouter } from "./router/role";
import { salaryRouter } from "./router/salary";
import { userRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  salary: salaryRouter,
  auth: authRouter,
  user: userRouter,
  hr: hrRouter,
  department: departmentRouter,
  acl: aclRouter,
  role: roleRouter,
  permission: permissionRouter,
  attendance: attendanceRouter,
  // leaverequest: LeaveRequests,
});

// export type definition of API
export type AppRouter = typeof appRouter;
