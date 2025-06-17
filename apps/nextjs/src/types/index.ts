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

export interface UserAllOutput {
  users: FullHrmUser[];
  total: number;
}

export interface LeaveRequestUpdateDTO {
  id: string;
  name: string;
  departmentId: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "1" | "P" | "P1" | "Pk" | "L" | "Nb" | "W";
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy: string;
  approvedAt: string;
}
