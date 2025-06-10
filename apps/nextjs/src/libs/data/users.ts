import { cache } from "react";

import type { FullHrmUser, UserStatusEnum } from "@acme/db";
import type { SalarySlipRecord } from "@acme/db/schema";
import { createServerClient } from "@acme/supabase";

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatusEnum;
  role: { id: string; name: string } | null;
  department: { id: string; name: string } | null;
  position: { id: string; name: string } | null;
  latestSalarySlip?: SalarySlipRecord | null;
}

export interface GetUserListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface UserListResult {
  users: UserListItem[];
  total: number;
}

export interface SalarySlip {
  id: string;
  createdAt: string;
  [key: string]: any;
}

export type UserByIdResult = FullHrmUser & {
  latestSalarySlip?: SalarySlip;
};

export interface MonthCount {
  month: number;
  count: number;
}

interface PositionCount {
  positionId: string;
  positionName: string;
  count: number;
}

export const getUserListUncached = async ({
  page = 1,
  pageSize = 20,
  search = "",
  sortBy = "email",
  order = "desc",
}: GetUserListParams): Promise<UserListResult> => {
  const supabase = await createServerClient();
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("users")
    .select(
      `id, email, firstName, lastName, status, role:role_id(id, name), department:department_id(id, name), position:position_id(id, name)`,
      { count: "exact" },
    );

  if (search) {
    query = query.or(
      `firstName.ilike.%${search}%,lastName.ilike.%${search}%,email.ilike.%${search}%`,
    );
  }

  query = query
    .range(offset, offset + pageSize - 1)
    .order(sortBy || "email", { ascending: order === "asc" });

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  // Lấy danh sách userId
  const userIds = (data ?? []).map((u: any) => u.id);

  // Lấy salary slip mới nhất cho từng user
  let latestSalaryByUserIds: SalarySlipRecord[] = [];

  if (userIds.length > 0) {
    const { data: salaryData, error: salaryError } = await supabase
      .from("salary_slips")
      .select("*")
      .in("user_id", userIds);

    if (salaryError) throw new Error(salaryError.message);

    // Lấy salary slip mới nhất cho từng user
    latestSalaryByUserIds = userIds
      .map((userId) => {
        const slips = (salaryData ?? []).filter(
          (s: any) => s.user_id === userId,
        );
        if (slips.length === 0) return null;
        return slips.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];
      })
      .filter(Boolean);
  }

  return {
    users: (data ?? []).map((u: any) => ({
      ...u,
      status: u.status as UserStatusEnum,
      role: u.role ?? null,
      department: u.department ?? null,
      position: u.position ?? null,
      latestSalarySlip:
        latestSalaryByUserIds.find((s: any) => s.user_id === u.id) ?? null,
    })),
    total: count ?? 0,
  };
};

export const getUserListFirstPageCached = cache(() =>
  getUserListUncached({
    page: 1,
    pageSize: 20,
    search: "",
    sortBy: "email",
    order: "desc",
  }),
);

export const getUserById = async (id: string): Promise<UserByIdResult> => {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      `*, role:roleId(*), department:departmentId(*), position:positionId(*), salarySlips:salarySlips(*)`,
    )
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  const latestSalary = Array.isArray(data.salarySlips)
    ? data.salarySlips.sort(
        (a: SalarySlip, b: SalarySlip) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0]
    : undefined;

  return {
    ...data,
    latestSalarySlip: latestSalary,
    status: data.status as UserStatusEnum,
  };
};

export const getCountUserByStatus = async (
  status: UserStatusEnum,
  year?: number,
): Promise<MonthCount[]> => {
  const supabase = await createServerClient();
  let query = supabase.from("users").select("created_at").eq("status", status);

  if (year) {
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year + 1}-01-01`);
    query = query
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString());
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const monthCounts: MonthCount[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    count: 0,
  }));

  for (const row of data ?? []) {
    const month = new Date(row.created_at).getMonth();
    if (month >= 0 && month < 12 && monthCounts[month]) {
      monthCounts[month].count++;
    }
  }
  return monthCounts;
};

export const getUserCountByPosition = async (): Promise<PositionCount[]> => {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("positionId, position:positionId(name)")
    .eq("status", "active");

  if (error) throw new Error(error.message);

  const counts: Record<string, { positionName: string; count: number }> = {};
  for (const row of data ?? []) {
    const id = row.positionId || "unknown";
    const name =
      Array.isArray(row.position) &&
      row.position.length > 0 &&
      row.position[0]?.name
        ? row.position[0].name
        : "Không xác định";
    if (!counts[id]) counts[id] = { positionName: name, count: 0 };
    counts[id].count++;
  }

  return Object.entries(counts).map(
    ([positionId, { positionName, count }]) => ({
      positionId,
      positionName,
      count,
    }),
  );
};
