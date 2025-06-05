import { createTRPCRouter } from "../trpc";
import { aclRouter } from "./acl";
import { attendanceRouter } from "./attendance";
import { authRouter } from "./auth";
import { departmentRouter } from "./department";
import { hrRouter } from "./hr";
import { leaveRequestRouter } from "./leaveRequest";
import { noteRouter } from "./notes";
import { permissionRouter } from "./permission";
import { positionRouter } from "./position";
import { roleRouter } from "./role";
import { salaryRouter } from "./salary";
import { userRouter } from "./users";

export const rootRouter = createTRPCRouter({
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
  notes: noteRouter,
});
