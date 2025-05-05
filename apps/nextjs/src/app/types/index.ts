import type { NotificationType, SalarySlipWithTableUser } from "@acme/db";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  time: string;
  read: boolean;
}

export interface InputLeaveRequest {
  userId: string;
  name: string;
  department: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}

export interface UserAllOutput {
  users: SalarySlipWithTableUser[];
  total: number;
}

export interface Department {
  id: number;
  userId: string;
  name: string;
  code: string;
  managerId: string | null;
  position: string;
  description: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}
