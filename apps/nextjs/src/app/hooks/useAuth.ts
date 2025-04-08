"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { checkAuth } from "~/app/actions/auth";

type UserAuth = User & { role: string };

export function useAuth() {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authUser = await checkAuth();
        setUser(authUser);
      } catch (error: any) {
        router.push("/login");
        console.error("Auth error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const isAdmin = user?.role === "admin";

  return { user, loading, isAdmin };
}
