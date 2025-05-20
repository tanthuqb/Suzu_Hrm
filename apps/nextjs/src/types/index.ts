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
