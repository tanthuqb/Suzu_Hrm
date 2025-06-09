import type { InferSelectModel } from "drizzle-orm";

import type { UserStatusEnum } from "../constants/user-status";
import type {
  AuditLogRecord,
  DepartmentRecord,
  HRMUser,
  NoteRecord,
  PostRecord,
  PostTagRecord,
  RoleRecord,
  SalarySlipRecord,
  TagRecord,
} from "../schema";

// User Types
export type UserRole =
  | "ADMIN"
  | "USER"
  | "MANAGER"
  | "user"
  | "admin"
  | "Admin";

// Notication Types
export type NotificationType = "Email" | "Sms" | "Important";

export type DBUser = InferSelectModel<typeof HRMUser>;

// full typpe of user is DBUser have slarySlip and role
export type FullHrmUser = DBUser & {
  latestSalarySlip?: SalarySlipRecord;
  roleName?: string;
  role?: Pick<RoleRecord, "id" | "name">;
  positions?: Pick<RoleRecord, "id" | "name">;
  departments?: Pick<DepartmentRecord, "id" | "name">;
};

// Lay User Table List
export type UserListItem = Pick<
  DBUser,
  "id" | "email" | "firstName" | "lastName" | "status"
> & {
  role: { id: string; name: string } | null;
  department: { id: string; name: string } | null;
  position: { id: string; name: string } | null;
};

// User With Role
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role_id: string;
  roleName: string;
  status: UserStatusEnum;
  departments?: Pick<DepartmentRecord, "id" | "name">;
  positions?: Pick<RoleRecord, "id" | "name">;
  role: {
    id: string;
    name: string;
    permissions: {
      id: string;
      action: string;
    }[];
  };
}

export interface ResponeAuthUser {
  status: boolean;
  message: string;
}

// Request/Response Types
export interface CreateUserInput {
  name: string;
  email: string;
  role: string;
  status?: UserStatusEnum;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: string;
  status?: UserStatusEnum;
}

export interface HRMUserInput {
  firstName: string;
  lastName: string;
  name: string;
  employeeCode: string;
  email: string;
  phone: string;
  role: string;
  status: UserStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceInput {
  user_id: string;
  status: string;
  date: string;
}

export type SalarySlipWithUser = HRMUserInput & {
  status: UserStatusEnum;
};

export type SalarySlipWithTableUser = DBUser & {
  status?: UserStatusEnum;
  latestSalarySlip?: SalarySlipRecord;
};

/* Permison Types and Role  */
export type PermissionAction = "create" | "read" | "update" | "delete";

export interface RoutePermission {
  path: string;
  actions: Record<PermissionAction, boolean>;
}

export interface FullAttendanceRecord {
  id: string;
  date: Date;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  status: string;
  isRemote: boolean | null;
  remoteReason: string | null;
  leaveRequestId: string | null;
  leaveRequestStatus: string | null;
  leaveRequestReason: string | null;
  leaveRequestsApprovedBy: string | null;
  approvedByName: string | null;
  office: string | null;
  departmentName: string | null;
}

export interface RecentActivity extends AuditLogRecord {
  user: DBUser | null;
}

export interface FullPostRecord extends PostRecord {
  author: Pick<DBUser, "id" | "firstName" | "lastName" | "email"> | null;
  notes: Pick<NoteRecord, "id" | "content" | "createdAt" | "userId">[] | null;
  post_tags: PostTagRecord[] | null;
  tags: TagRecord[] | null;
}
