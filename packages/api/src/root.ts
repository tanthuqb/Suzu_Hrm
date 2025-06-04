import { lazy } from "@trpc/server";

import { aclRouter } from "./router/acl";
import { attendanceRouter } from "./router/attendance";
import { authRouter } from "./router/auth";
import { departmentRouter } from "./router/department";
import { hrRouter } from "./router/hr";
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
  position: positionRouter,
  posts: postsRouter,
  notes: noteRouter,
  auditlog: lazy(() => import("./router/auditlog")),
  leaveRequest: lazy(() => import("./router/leave-requests")),
});

export type AppRouter = typeof appRouter;
