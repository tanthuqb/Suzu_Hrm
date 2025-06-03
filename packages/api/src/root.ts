import { lazy } from "@trpc/server";

import { aclRouter } from "./router/acl";
import { attendanceRouter } from "./router/attendance";
import { auditlogRouter } from "./router/auditlog";
import { authRouter } from "./router/auth";
import { departmentRouter } from "./router/department";
import { hrRouter } from "./router/hr";
import { leaveRequestRouter } from "./router/leave-requests";
import { noteRouter } from "./router/notes";
import { permissionRouter } from "./router/permission";
import { positionRouter } from "./router/position";
import { postsRouter } from "./router/posts";
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
  leaveRequest: leaveRequestRouter,
  position: positionRouter,
  auditlog: auditlogRouter,
  // posts: postsRouter,
  // notes: noteRouter,
});

export type AppRouter = typeof appRouter;
