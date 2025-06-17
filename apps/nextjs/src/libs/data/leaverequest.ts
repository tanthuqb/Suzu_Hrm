import { createBrowserClient } from "@acme/supabase";

import { logger } from "../logger";

export interface LeaveBalanceRecord {
  id: string;
  user_id: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequestRecord {
  id: string;
  name: string;
  reason: string;
  start_date: string;
  end_date: string;
  status: "1" | "P" | "P1" | "Pk" | "L" | "Nb" | "W";
  approvedStatus: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedByName: string | null;
  approvedById: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  positionName: string | null;
  departmentId?: string | null;
  departmentName: string | null;
  office: "NTL" | "SKY" | null;
}

export interface GetAllLeaveRequestsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "pending" | "approved" | "rejected";
  userId?: string;
}

export interface GetAllLeaveRequestsResponse {
  leaveRequests: LeaveRequestRecord[];
  pagination: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export async function getAllLeaveRequests({
  page = 1,
  pageSize = 20,
  search,
  status,
  userId,
}: GetAllLeaveRequestsOptions): Promise<GetAllLeaveRequestsResponse> {
  const supabase = createBrowserClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("leave_requests")
    .select(
      `
        id,
        name,
        start_date, 
        end_date,       
        status,
        reason,
        approval_status,
        approved_at,
        created_at,
        approver:approved_by (
          id,
          name
        ),
        requester:user_id (
          id,
          name,
          email,
          position:position_id (
            id,
            name
          ),
          department:department_id (
            id,
            name,
            office
          )
        )
      `,
      { count: "exact" },
    )
    .range(from, to)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("reason", `%${search}%`);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, count, error } = await query;
  if (error) {
    logger.error("Error fetching leave requests", {
      page,
      pageSize,
      search,
      status,
      userId,
      error,
    });
    throw new Error(error.message);
  }

  const leaveRequests: LeaveRequestRecord[] = (data ?? []).map((r) => {
    const requesterRaw = r.requester;
    const requester = Array.isArray(requesterRaw)
      ? requesterRaw[0]
      : requesterRaw;

    const departmentRaw = requester?.department;
    const department = Array.isArray(departmentRaw)
      ? departmentRaw[0]
      : departmentRaw;

    const positionRaw = requester?.position;
    const position = Array.isArray(positionRaw) ? positionRaw[0] : positionRaw;

    const approverRaw = r.approver;
    const approver = Array.isArray(approverRaw) ? approverRaw[0] : approverRaw;

    return {
      id: r.id,
      name: r.name,
      reason: r.reason,
      start_date: r.start_date,
      end_date: r.end_date,
      status: r.status,
      approvedStatus: r.approval_status,
      createdAt: r.created_at,
      approvedByName: approver?.name ?? null,
      approvedById: approver?.id ?? null,
      userId: requester?.id ?? "",
      userName: requester?.name ?? "",
      userEmail: requester?.email ?? "",
      positionName: position?.name ?? null,
      departmentName: department?.name ?? null,
      departmentId: department?.id ?? null,
      office: department?.office ?? null,
    };
  });

  return {
    leaveRequests,
    pagination: {
      totalCount: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    },
  };
}

export async function getLeaveRequestById(
  id: string,
): Promise<LeaveRequestRecord | null> {
  const supabase = await createBrowserClient();

  const { data, error } = await supabase
    .from("leave_requests")
    .select(
      `
        id,
        name,
        start_date, 
        end_date,       
        status,
        reason,
        approval_status,
        approved_at,
        created_at,
        approver:approved_by (
          id,
          name
        ),
        requester:user_id (
          id,
          name,
          email,
          position:position_id (
            id,
            name
          ),
          department:department_id (
            id,
            name,
            office
          )
        )
      `,
      { count: "exact" },
    )
    .eq("id", id)
    .single();
  if (error) {
    logger.error("Error fetching leave request by ID", {
      id,
      error,
    });
  }
  if (error) throw new Error(error.message);
  if (!data) return null;

  const requesterRaw = data.requester;
  const requester = Array.isArray(requesterRaw)
    ? requesterRaw[0]
    : requesterRaw;

  const departmentRaw = requester?.department;
  const department = Array.isArray(departmentRaw)
    ? departmentRaw[0]
    : departmentRaw;

  const positionRaw = requester?.position;
  const position = Array.isArray(positionRaw) ? positionRaw[0] : positionRaw;

  const approverRaw = data.approver;
  const approver = Array.isArray(approverRaw) ? approverRaw[0] : approverRaw;

  return {
    id: data.id,
    name: data.name,
    reason: data.reason,
    start_date: data.start_date,
    end_date: data.end_date,
    status: data.status,
    approvedStatus: data.approval_status,
    createdAt: data.created_at,
    approvedByName: approver?.name ?? null,
    approvedById: approver?.id ?? null,
    userId: requester?.id ?? "",
    userName: requester?.name ?? "",
    userEmail: requester?.email ?? "",
    positionName: position?.name ?? null,
    departmentId: department?.id ?? null,
    departmentName: department?.name ?? null,
    office: department?.office ?? null,
  };
}

export async function getLeaveBalanceByUserId(
  userId: string,
  year: number = new Date().getFullYear(),
): Promise<LeaveBalanceRecord> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("leave_balances")
    .select("*")
    .eq("user_id", userId)
    .eq("year", year)
    .order("year", { ascending: false })
    .limit(1)
    .single();

  logger.error("Error fetching leave balance by user ID", {
    userId,
    year,
    error,
  });
  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return data as LeaveBalanceRecord;
}
