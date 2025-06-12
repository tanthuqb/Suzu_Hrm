import { createServerClient } from "@acme/supabase";

import { logger } from "~/libs/logger";

export interface AttendanceRecord {
  id: string;
  date: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  status:
    | "1"
    | "W"
    | "P"
    | "P1"
    | "P2"
    | "BH"
    | "Rk"
    | "x/2"
    | "L"
    | "Nb"
    | "Nb1"
    | "Nb2"
    | "CT"
    | "BD"
    | "BC"
    | "BC1"
    | "BC2";
  isRemote: boolean;
  remoteReason: string | null;
  leaveRequestId: string | null;
  leaveRequestStatus: "pending" | "approved" | "rejected" | null;
  leaveRequestReason: string | null;
  approvedByName: string | null;
  office: "SKY" | "NTL" | null;
  departmentName: string | null;
  postion?: string | null;
}

export interface GetAllAttendancesOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  userId?: string;
}

export interface GetAllAttendancesResponse {
  attendances: AttendanceRecord[];
  pagination: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export async function getAllAttendances(
  options: GetAllAttendancesOptions = {},
): Promise<GetAllAttendancesResponse> {
  const supabase = await createServerClient();

  const page = options.page && options.page > 0 ? options.page : 1;
  const pageSize =
    options.pageSize && options.pageSize > 0 ? options.pageSize : 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("attendances")
    .select(
      `
        id,
        date,
        user_id,
        status,
        is_remote,
        remote_reason,
        leave_request_id,
        user:user_id(id, name, email, department:department_id(id, name, office), position: position_id(name)),
        leave_requests:leave_request_id(
          id,
          approval_status,
          reason,
          approved_by:users!user_id(id, name)
        )
      `,
      { count: "exact" },
    )
    .order("date", { ascending: true })
    .range(from, to);

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }
  if (options.search) {
    query = query.ilike("users.name", `%${options.search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  const records: AttendanceRecord[] = (data ?? []).map((att: any) => {
    const user = Array.isArray(att.user) ? att.user[0] : att.user;
    const department = Array.isArray(user?.department)
      ? user.department[0]
      : user?.department;
    const position = Array.isArray(user?.position)
      ? user.position[0]
      : user?.position;

    const leaveRequest = Array.isArray(att.leave_requests)
      ? att.leave_requests[0]
      : att.leave_requests;
    const approvedBy = Array.isArray(leaveRequest?.approved_by)
      ? leaveRequest.approved_by[0]?.name
      : leaveRequest?.approved_by?.name;

    return {
      id: att.id,
      date: att.date,
      userId: att.user_id,
      userName: user?.name ?? null,
      userEmail: user?.email ?? null,
      status: att.status,
      isRemote: att.is_remote,
      remoteReason: att.remote_reason ?? null,
      leaveRequestId: att.leave_request_id ?? null,
      leaveRequestStatus: leaveRequest?.approval_status ?? null,
      leaveRequestReason: leaveRequest?.reason ?? null,
      approvedByName: approvedBy ?? null,
      office: department?.office ?? null,
      departmentName: department?.name ?? null,
      postion: position?.name ?? null,
    };
  });

  return {
    attendances: records,
    pagination: {
      totalCount: count ?? 0,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    },
  };
}
