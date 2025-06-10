import { cache } from "react";

import { createServerClient } from "@acme/supabase";

export interface AuditLog {
  [key: string]: any;
  users?: any;
}

export interface AuditLogPagination {
  logs: AuditLog[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const getAllAuditLogs = cache(
  async ({
    userId,
    email,
    action,
    entity,
    request,
    response,
    payload,
    page = 1,
    pageSize = 20,
  }: {
    userId?: string;
    email?: string;
    action?: string;
    entity?: string;
    request?: string;
    response?: string;
    payload?: string;
    page?: number;
    pageSize?: number;
  }): Promise<AuditLogPagination> => {
    const supabase = await createServerClient();
    let query = supabase
      .from("audit_logs")
      .select("*, users(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (userId) query = query.eq("user_id", userId);
    if (email) query = query.eq("users.email", email);
    if (action) query = query.eq("action", action);
    if (entity) query = query.eq("entity", entity);
    if (request) query = query.eq("request", request);
    if (response) query = query.eq("response", response);
    if (payload) query = query.eq("payload", payload);
    const { data, error, count } = await query;
    if (error) {
      console.error("Supabase error:", error.message);
      throw new Error("Failed to fetch audit logs");
    }
    return {
      logs: data,
      pagination: {
        total: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      },
    };
  },
);
