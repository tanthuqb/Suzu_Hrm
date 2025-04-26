import type { User } from "@supabase/supabase-js";
import type { InferSelectModel } from "drizzle-orm";

import type { HRMUser, SalarySlipRecord } from "../schema";

// User Types
export type UserRole =
  | "ADMIN"
  | "USER"
  | "MANAGER"
  | "user"
  | "admin"
  | "Admin";

export type UserStatus = "Active" | "Suspended";

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
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
// User With Role
export interface AuthUser extends User {
  role: string;
  firstName?: string;
  lastName?: string;
}

// Request/Response Types
export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface HRMUserInput {
  firstName: string;
  lastName: string;
  name: string;
  employeeCode: string;
  email: string;
  phone: string;
  role: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceInput {
  user_id: string;
  status: string;
  date: string;
}

export type SalarySlipWithUser = HRMUserInput & {
  role: UserRole;
  status: UserStatus;
};

export type SalarySlipWithTableUser = DBUser & {
  role: UserRole;
  status?: UserStatus;
  latestSalarySlip?: SalarySlipRecord;
};
