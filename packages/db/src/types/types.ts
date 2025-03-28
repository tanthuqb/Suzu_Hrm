import type { InferSelectModel } from "drizzle-orm";

import type { HRMUser } from "../schema";

// User Types
export type UserRole = "ADMIN" | "USER" | "MANAGER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export type DBUser = InferSelectModel<typeof HRMUser>;

// User Types
export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
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
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
