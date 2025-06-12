import type { UserStatusEnum } from "@acme/db";
import { createServerClient } from "@acme/supabase";

import { logger } from "../logger";

export interface UserPositionCount {
  positionId: string;
  positionName: string;
  count: number;
}

interface UserPosition {
  position_id: string | null;
  position: { id: string; name: string } | null;
}

export interface Position {
  id: string;
  name: string;
  department_id: string;
  created_at: Date;
  updated_at: Date;
  department?: {
    id: string;
    name: string;
  };
}

export async function getAllPositions(): Promise<Position[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("positions")
    .select(
      `id, name, department_id, created_at, updated_at, department:department_id(id, name)`,
    )
    .order("created_at", { ascending: true });
  logger.error("Error fetching positions", {
    error,
  });
  if (error) throw new Error(error.message);
  return data as unknown as Position[];
}

export async function getPositionById(id: number) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("positions")
    .select("*")
    .eq("id", id)
    .single();
  logger.error("Error fetching position by ID", {
    id,
    error,
  });
  if (error) throw new Error(error.message);

  return data;
}

export async function getAllUserCountsByPosition(
  status: UserStatusEnum.ACTIVE,
) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("position_id, position:position_id(id, name)")
    .eq("status", status);

  if (error) {
    logger.error("Error fetching user counts by position", {
      error,
    });
    throw new Error("Failed to fetch user counts by position");
  }

  const countsMap = new Map<string, UserPositionCount>();

  for (const item of data ?? ([] as UserPosition[])) {
    const posId = item.position_id;
    let posName = "Unknown";
    if (
      item.position &&
      typeof item.position === "object" &&
      "name" in item.position
    ) {
      posName = item.position.name ?? "Unknown";
    }

    if (!posId) continue;

    if (!countsMap.has(posId)) {
      countsMap.set(posId, {
        positionId: posId,
        positionName: posName,
        count: 1,
      });
    } else {
      countsMap.get(posId)!.count += 1;
    }
  }

  return Array.from(countsMap.values());
}
