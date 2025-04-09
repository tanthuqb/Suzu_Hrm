import { AttendanceStatus } from "@acme/db";

export function normalizeStatus(input: string): AttendanceStatus | null {
  const raw = input.trim().toUpperCase();

  if (raw === "1" || raw === "W") return AttendanceStatus.WorkDay;

  if (Object.values(AttendanceStatus).includes(raw as AttendanceStatus)) {
    return raw as AttendanceStatus;
  }

  return null;
}
