export const approvalStatusEnum = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const approvalStatusEnumValues = [
  "pending",
  "approved",
  "rejected",
] as const;

export type ApprovalStatus =
  (typeof approvalStatusEnum)[keyof typeof approvalStatusEnum];
