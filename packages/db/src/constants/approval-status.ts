export const approvalStatusEnum = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;
export type ApprovalStatus =
  (typeof approvalStatusEnum)[keyof typeof approvalStatusEnum];
