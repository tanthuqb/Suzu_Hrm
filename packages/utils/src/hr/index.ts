import { AttendanceStatus } from "@acme/db";

// Chuyển đổi các trạng thái chấm công từ file import về dạng enum
export function normalizeStatus(input: string): AttendanceStatus | null {
  const raw = input.trim().toUpperCase();

  if (raw === "1" || raw === "W") return AttendanceStatus.WorkDay;

  if (Object.values(AttendanceStatus).includes(raw as AttendanceStatus)) {
    return raw as AttendanceStatus;
  }

  return null;
}

// Chuyển đổi các trạng thái chấm công từ file import về dạng string
export function normalizeStatusValue(value: string): string | null {
  const val = value.toLowerCase().trim();
  switch (val) {
    case "1":
      return AttendanceStatus.WorkDay;
    case "w":
      return AttendanceStatus.WorkFromHome as string;
    case "p":
      return AttendanceStatus.PaidLeaveFull as string;
    case "rk":
      return AttendanceStatus.UnpaidLeave as string;
    case "p1":
      return AttendanceStatus.PaidLeaveHalfWork as string;
    case "p2":
      return AttendanceStatus.PaidLeaveHalfUnpaid as string;
    case "l":
      return AttendanceStatus.PaidHoliday as string;
    case "ct":
      return AttendanceStatus.CompanyLeave as string;
    case "nb":
      return AttendanceStatus.CompensateFull as string;
    case "nb1":
      return AttendanceStatus.CompensateHalfWork as string;
    case "nb2":
      return AttendanceStatus.CompensateHalfUnpaid as string;
    case "bh":
      return AttendanceStatus.InsuranceLeave as string;
    case "bd":
      return AttendanceStatus.NightCompensate as string;
    case "bc":
      return AttendanceStatus.SundayCompensateFull as string;
    case "bc1":
      return AttendanceStatus.SundayCompensateHalfWork as string;
    case "bc2":
      return AttendanceStatus.SundayCompensateHalfUnpaid as string;
    case "x/2":
      return AttendanceStatus.HalfPaidHalfUnpaid as string;
    default:
      return null;
  }
}

// parse rawValue như "1p", "rw" thành array trạng thái chuẩn
export function parseStatusSymbols(raw: string): string[] {
  const symbols = raw.match(/[a-z]+|[0-9]+/gi) || [];
  return symbols
    .map((s) => normalizeStatusValue(s.trim().toLowerCase()))
    .filter(Boolean) as string[];
}

// lấy tháng hiện tại theo giờ Việt Nam
export function getCurrentVietnamMonth() {
  const nowVN = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
  );
  return `${nowVN.getFullYear()}-${String(nowVN.getMonth() + 1).padStart(2, "0")}`;
}
