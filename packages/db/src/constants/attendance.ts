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
