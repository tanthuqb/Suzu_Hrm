import type { LeaveRequestUpdateDTO } from "~/types/index";
import { toISOStringSafe } from "~/libs";

export function toLeaveRequestUpdateDTO(
  form: any,
  leaveRequest: any,
  userId: string,
): LeaveRequestUpdateDTO {
  return {
    id: leaveRequest.id,
    name: form.name,
    departmentId: leaveRequest.departmentId,
    userId: leaveRequest.userId,
    startDate: toISOStringSafe(form.startDate),
    endDate: toISOStringSafe(form.endDate),
    reason: form.reason ?? "",
    status: form.status,
    approvalStatus: form.approvalStatus,
    approvedBy: userId,
    approvedAt: new Date().toISOString(),
  };
}
