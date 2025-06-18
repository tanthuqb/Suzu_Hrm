import type { AttendanceStatus } from "@acme/db";
import { createServerClient } from "@acme/supabase";

export interface AttendanceRecord {
  id: string;
  date: string;
  userId: string;
  phone?: string | null;
  userFirtName: string | null;
  userLastName: string | null;
  userName: string | null;
  userEmail: string | null;
  status: "1" | "P" | "P1" | "Pk" | "L" | "Nb" | "W";
  isRemote: boolean;
  remoteReason: string | null;
  leaveRequestId: string | null;
  leaveRequestStatus: "pending" | "approved" | "rejected" | null;
  leaveRequestReason: string | null;
  approvedByName: string | null;
  office: "SKY" | "NTL" | null;
  departmentName: string | null;
  postion?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string | null;
}

export interface GetAllAttendancesOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  approvedById?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
}

export interface AttendanceStatusCount {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userFirtName: string | null;
  userLastName: string | null;
  counts: Record<AttendanceStatus, number>;
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
        user:user_id(
          id, name, email, firstName, lastName, phone
          department:department_id(id, name, office),
          position:position_id(name)
        ),
        leave_requests:leave_request_id(
          id,
          approval_status,
          reason,
          start_date,
          end_date,
          approved_by:users!user_id(id, name)
        )
      `,
      { count: "exact" },
    )
    .order("date", { ascending: true })
    .range(from, to);

  // Filter theo user_id
  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  // Filter theo tên người dùng (user.name)
  if (options.search) {
    query = query.ilike("users.name", `%${options.search}%`);
  }

  // Filter theo khoảng thời gian
  if (options.fromDate) {
    query = query.gte("date", options.fromDate);
  }
  if (options.toDate) {
    query = query.lte("date", options.toDate);
  }

  // Filter theo người duyệt (approved_by user id trong leave_requests)
  if (options.approvedById) {
    query = query.eq("leave_requests.approved_by", options.approvedById);
  }

  // Filter theo trạng thái duyệt
  if (options.approvalStatus) {
    query = query.eq("leave_requests.approval_status", options.approvalStatus);
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
      userFirtName: user?.firstName ?? null,
      userLastName: user?.lastName ?? null,
      userEmail: user?.email ?? null,
      userName: user?.name ?? null,
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
      startDate: leaveRequest?.start_date ?? null,
      endDate: leaveRequest?.end_date ?? null,
      createdAt: leaveRequest?.created_at ?? null,
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

export async function countAttendanceByStatus({
  userId,
  fromDate,
  toDate,
}: {
  userId?: string;
  fromDate: string;
  toDate: string;
}): Promise<AttendanceStatusCount[]> {
  const supabase = await createServerClient();
  console.log("countAttendanceByStatus", { userId, fromDate, toDate });
  const { data, error } = await supabase
    .from("attendances")
    .select(
      `
        user_id,
        status,
        user:users!attendances_user_id_fkey(
          id,
          name,
          email,
          firstName,
          lastName
        )
      `,
    )
    .eq("user_id", userId)
    .gte("date", fromDate)
    .lte("date", toDate);

  if (error) throw new Error(error.message);

  const groupedMap = new Map<string, AttendanceStatusCount>();

  for (const row of data ?? []) {
    const userId = row.user_id;
    const status = row.status as AttendanceStatus;

    if (!groupedMap.has(userId)) {
      const user = Array.isArray(row.user) ? row.user[0] : row.user;
      groupedMap.set(userId, {
        userId,
        userName: user?.name ?? null,
        userEmail: user?.email ?? null,
        userFirtName: user?.firstName ?? null,
        userLastName: user?.lastName ?? null,
        counts: {
          "1": 0,
          P: 0,
          P1: 0,
          Pk: 0,
          L: 0,
          Nb: 0,
          W: 0,
        },
      });
    }

    const userData = groupedMap.get(userId)!;
    if (userData.counts[status] !== undefined) {
      userData.counts[status] += 1;
    }
  }

  return Array.from(groupedMap.values());
}
