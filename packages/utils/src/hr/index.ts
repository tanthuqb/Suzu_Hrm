import { AttendanceStatus } from "@acme/db";

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
    case "l":
      return AttendanceStatus.PaidHoliday as string;
    default:
      return null;
  }
}

// parse rawValue như "1p", "rw" thành array trạng thái chuẩn
export function parseStatusSymbols(raw: string): string[] {
  const symbols = raw.match(/[a-z]+|[0-9]+/gi) ?? [];
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

// Kiểm tra xem chuỗi có phải là ngày hợp lệ theo định dạng YYYY-MM-DD không
export function isValidDateString(dateString: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function normalizeSheetNameToMonth(sheetName: string): string | null {
  const matched = /\d{1,2}/.exec(sheetName);
  if (!matched) return null;

  const monthNumber = parseInt(matched[0], 10);
  if (monthNumber < 1 || monthNumber > 12) return null;

  return monthNumber.toString().padStart(2, "0");
}
