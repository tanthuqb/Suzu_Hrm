"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthUser } from "@acme/db";

import { checkAuth } from "~/app/actions/auth";
import WFHForm from "./form/wfh-form";

export default function WorkFromHomeForm() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const u = await checkAuth();
      if (!u) {
        router.push("/auth/login");
      }
      setUser(u);
    };
    void fetchUser();
  }, [router]);

  if (!user) return <p className="text-muted-foreground">Đang tải...</p>;

  return <WFHForm user={user} />;
}
