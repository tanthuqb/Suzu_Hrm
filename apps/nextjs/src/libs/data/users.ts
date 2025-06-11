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
  userId: string;
  month: string;
  basicSalary: number;
  workingSalary: number;
  bonus: number;
  allowance: number;
  otherIncome: number;
  totalIncome: number;
  socialInsuranceBase?: number | null;
  socialInsuranceDeducted?: number | null;
  unionFee?: number | null;
  taxableIncome?: number | null;
  personalDeduction?: number | null;
  familyDeduction?: number | null;
  taxIncomeFinal?: number | null;
  personalIncomeTax?: number | null;
  advance?: number | null;
  otherDeductions?: number | null;
  totalDeductions?: number | null;
  netIncome: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
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

export async function getUserById(id: string): Promise<UserByIdResult | null> {
  const supabase = await createServerClient();

  // Lấy user
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select(
      `
        *,
        role:role_id ( id, name ),
        department:department_id ( id, name ),
        position:position_id ( id, name )
      `,
    )
    .eq("id", id)
    .single();

  if (userError || !userData) {
    console.error("Failed to get user:", userError?.message);
    return null;
  }

  // Lấy phiếu lương gần nhất
  const { data: salaryData, error: salaryError } = await supabase
    .from("salary_slips")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (salaryError) {
    console.error("Failed to get salary:", salaryError.message);
  }

  // Map đúng type
  const latestSalarySlip: SalarySlip | undefined = salaryData
    ? {
        id: salaryData.id,
        userId: salaryData.user_id,
        month: salaryData.month,
        basicSalary: salaryData.basic_salary,
        workingSalary: salaryData.working_salary,
        bonus: salaryData.bonus ?? 0,
        allowance: salaryData.allowance ?? 0,
        otherIncome: salaryData.other_income ?? 0,
        totalIncome: salaryData.total_income,
        socialInsuranceBase: salaryData.social_insurance_base ?? undefined,
        socialInsuranceDeducted:
          salaryData.social_insurance_deduction ?? undefined,
        unionFee: salaryData.union_fee ?? undefined,
        taxableIncome: salaryData.taxable_income ?? undefined,
        personalDeduction: salaryData.personal_deduction ?? undefined,
        familyDeduction: salaryData.family_deduction ?? undefined,
        taxIncomeFinal: salaryData.tax_income_final ?? undefined,
        personalIncomeTax: salaryData.personal_income_tax ?? undefined,
        advance: salaryData.advance ?? undefined,
        otherDeductions: salaryData.other_deductions ?? undefined,
        totalDeductions: salaryData.total_deductions ?? undefined,
        netIncome: salaryData.net_income,
        status: salaryData.status,
        createdAt: salaryData.created_at
          ? new Date(salaryData.created_at).toISOString()
          : "",
        updatedAt: salaryData.updated_at
          ? new Date(salaryData.updated_at).toISOString()
          : undefined,
      }
    : undefined;

  return {
    ...userData,
    avatar: userData.avatar_url,
    status: userData.status as UserStatusEnum,
    latestSalarySlip,
    role: userData.role?.id
      ? { id: userData.role.id, name: userData.role.name }
      : undefined,
    departments: userData.department?.id
      ? { id: userData.department.id, name: userData.department.name }
      : undefined,
    positions: userData.position?.id
      ? { id: userData.position.id, name: userData.position.name }
      : undefined,
  };
}

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
