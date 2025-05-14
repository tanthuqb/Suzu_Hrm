import type { FullHrmUser, NotificationType } from "@acme/db";

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
  users: FullHrmUser[];
  total: number;
}
