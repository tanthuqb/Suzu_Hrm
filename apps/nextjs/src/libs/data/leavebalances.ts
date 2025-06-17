import { createServerClient } from "@acme/supabase";

import { logger } from "../logger";

export interface LeaveBalance {
  id: string;
  userId: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  createdAt: Date;
  updatedAt: Date;
  year: number;
}

export async function getLeaveBalanceByUserId(
  userId: string,
): Promise<LeaveBalance> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("leave_balances")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .single();
  if (error) {
    logger.error("Error fetching leave balances", {
      error,
    });
    throw new Error(error.message);
  }
  return data as LeaveBalance;
}
