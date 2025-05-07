"use client";

import { useEffect, useState } from "react";

export function useSupabaseSession() {
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session-client");
        if (!response.ok) throw new Error("Không thể lấy session từ server");

        const { session } = await response.json();
        if (session?.access_token) {
          setSession(session);
        } else {
          throw new Error("Không có access_token trong session");
        }
      } catch (err: any) {
        console.error("Lỗi lấy session từ API:", err.message);
        setError(err.message);
      }
    };

    fetchSession();
  }, []);

  return { session, error };
}
