export enum AttendanceStatus {
  WorkDay = "1", // ngày công có lương
  WorkFromHome = "W", // ngày công làm việc tại nhà có lương
  PaidLeaveFull = "P", // nghỉ Phép cả ngày có lương
  PaidLeaveHalfWork = "P1", // nghỉ Phép nửa ngày có lương (nửa ngày có đi làm)
  PaidLeaveHalfUnpaid = "P2", // nghỉ Phép nửa ngày có lương (nửa ngày nghỉ ko lương)
  InsuranceLeave = "BH", //nghỉ chế độ Bảo hiểm và BH chi trả
  UnpaidLeave = "Rk", // nghỉ cả ngày ko lương
  HalfPaidHalfUnpaid = "x/2", // làm nửa ngày có lương (nửa ngày nghỉ ko lương)
  PaidHoliday = "L", // nghỉ lễ có lương
  CompensateFull = "Nb", // nghỉ bù cả ngày có lương (BC+BD)
  CompensateHalfWork = "Nb1", // nghỉ bù nửa ngày có lương (nửa ngày đi làm)
  CompensateHalfUnpaid = "Nb2", // nghỉ bù nửa ngày có lương (nửa ngày nghỉ ko lương)
  CompanyLeave = "CT", // nghỉ chế độ Công ty có lương
  NightCompensate = "BD", // nghỉ bù 3 đêm có lương
  SundayCompensateFull = "BC", // nghỉ bù cả ngày Chủ nhật có lương
  SundayCompensateHalfWork = "BC1", // nghỉ bù ngày Chủ nhật có lương (phần lệch và nửa ngày đi làm)
  SundayCompensateHalfUnpaid = "BC2", //nghỉ bù ngày Chủ nhật có lương (phần lệch và nửa ngày nghỉ ko lương)
}

export const AttendanceStatusLabel: Record<AttendanceStatus, string> = {
  [AttendanceStatus.WorkDay]: "Ngày công có lương",
  [AttendanceStatus.WorkFromHome]: "Làm việc tại nhà có lương",
  [AttendanceStatus.PaidLeaveFull]: "Nghỉ phép cả ngày có lương",
  [AttendanceStatus.PaidLeaveHalfWork]:
    "Nghỉ phép nửa ngày có lương (nửa ngày đi làm)",
  [AttendanceStatus.PaidLeaveHalfUnpaid]:
    "Nghỉ phép nửa ngày có lương (nửa ngày nghỉ không lương)",
  [AttendanceStatus.InsuranceLeave]: "Nghỉ chế độ bảo hiểm",
  [AttendanceStatus.UnpaidLeave]: "Nghỉ cả ngày không lương",
  [AttendanceStatus.HalfPaidHalfUnpaid]:
    "Làm nửa ngày có lương (nửa ngày nghỉ không lương)",
  [AttendanceStatus.PaidHoliday]: "Nghỉ lễ có lương",
  [AttendanceStatus.CompensateFull]: "Nghỉ bù cả ngày có lương",
  [AttendanceStatus.CompensateHalfWork]:
    "Nghỉ bù nửa ngày có lương (nửa ngày đi làm)",
  [AttendanceStatus.CompensateHalfUnpaid]:
    "Nghỉ bù nửa ngày có lương (nửa ngày nghỉ không lương)",
  [AttendanceStatus.CompanyLeave]: "Nghỉ chế độ công ty có lương",
  [AttendanceStatus.NightCompensate]: "Nghỉ bù 3 đêm có lương",
  [AttendanceStatus.SundayCompensateFull]: "Nghỉ bù cả ngày Chủ nhật có lương",
  [AttendanceStatus.SundayCompensateHalfWork]:
    "Nghỉ bù Chủ nhật (nửa ngày đi làm)",
  [AttendanceStatus.SundayCompensateHalfUnpaid]:
    "Nghỉ bù Chủ nhật (nửa ngày nghỉ không lương)",
};
