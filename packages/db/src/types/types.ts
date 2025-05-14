import type { InferSelectModel } from "drizzle-orm";

import type { UserStatusEnum } from "../constants/user-status";
import type {
  DepartmentRecord,
  HRMUser,
  RoleRecord,
  SalarySlipRecord,
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

// User Types
export interface IUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employeeCode: string;
  role: string;
  status: UserStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

// full typpe of user is DBUser have slarySlip and role
export type FullHrmUser = DBUser & {
  status?: UserStatusEnum;
  latestSalarySlip?: SalarySlipRecord;
  roleName?: string;
  role?: Pick<RoleRecord, "id" | "name">;
  departments?: Pick<DepartmentRecord, "id" | "name">;
};

// User With Role
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role_id: string;
  role: {
    id: string;
    name: string;
    permissions: {
      id: string;
      action: string;
    }[];
  };
}

export interface SupabaseUserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  role_id: string;
  role:
    | {
        id: string;
        name: string;
        permissions: { id: string; action: string }[];
      }
    | {
        id: string;
        name: string;
        permissions: { id: string; action: string }[];
      }[];
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
