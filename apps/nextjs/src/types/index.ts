import type { FullHrmUser, NotificationType } from "@acme/db";
import { attendanceStatusEnumValues } from "@acme/db";

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
  status:
    | "1"
    | "W"
    | "P"
    | "P1"
    | "P2"
    | "BH"
    | "Rk"
    | "x/2"
    | "L"
    | "Nb"
    | "Nb1"
    | "Nb2"
    | "CT"
    | "BD"
    | "BC"
    | "BC1"
    | "BC2";
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy: string;
  approvedAt: string;
}
