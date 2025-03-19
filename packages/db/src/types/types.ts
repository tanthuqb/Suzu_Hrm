import type { InferSelectModel } from "drizzle-orm";

import type { HRMUser, Post } from "../schema";

// User Types
export type UserRole = "ADMIN" | "USER" | "MANAGER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export type DBUser = InferSelectModel<typeof HRMUser>;

// Post Types
export interface IPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Types
export interface IUser {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type DBPost = InferSelectModel<typeof Post>;

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

export interface CreatePostInput {
  title: string;
  content: string;
  authorId: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
}

export type UserWithPassword = Pick<IUser, "id" | "name" | "email" | "role"> & {
  password: string;
};
