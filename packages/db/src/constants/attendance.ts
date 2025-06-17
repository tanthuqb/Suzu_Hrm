export enum AttendanceStatus {
  WorkDay = "1", // ngày công có lương
  PaidLeaveFull = "P", // nghỉ Phép cả ngày có lương
  PaidLeaveHalfWork = "P1", // nghỉ Phép nửa ngày có lương (nửa ngày có đi làm)
  UnpaidLeave = "Pk", // nghỉ Phép cả ngày không lương
  PaidHoliday = "L", // nghỉ lễ có lương
  CompensateFull = "Nb", // nghỉ bù cả ngày có lương (BC+BD)
  WorkFromHome = "W", // ngày công làm việc tại nhà có lương
}

export const AttendanceStatusLabel: Record<AttendanceStatus, string> = {
  [AttendanceStatus.WorkDay]: "Ngày công có lương",
  [AttendanceStatus.PaidLeaveFull]: "Nghỉ phép cả ngày có lương",
  [AttendanceStatus.PaidLeaveHalfWork]:
    "Nghỉ phép nửa ngày có lương (nửa ngày đi làm)",
  [AttendanceStatus.UnpaidLeave]: "Nghỉ cả ngày không lương",
  [AttendanceStatus.PaidHoliday]: "Nghỉ lễ có lương",
  [AttendanceStatus.CompensateFull]: "Nghỉ bù cả ngày có lương",
  [AttendanceStatus.WorkFromHome]: "Làm việc tại nhà có lương",
};

export const attendanceStatusEnumValues = [
  "1",
  "P",
  "P1",
  "Pk",
  "L",
  "Nb",
  "W",
] as const;
