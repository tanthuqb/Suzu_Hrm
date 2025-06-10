import type { LeaveRequestsRecord } from "@acme/db/schema";
import { createBrowserClient } from "@acme/supabase";

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

export async function getAllLeaveRequests(): Promise<LeaveRequestsRecord[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("leave_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as LeaveRequestsRecord[];
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

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }
  return data as LeaveBalanceRecord;
}
