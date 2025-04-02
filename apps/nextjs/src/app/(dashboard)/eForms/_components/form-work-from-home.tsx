"use client";

import { useEffect, useState } from "react";

import type { AuthUser } from "@acme/db";

import { checkAuth } from "~/app/actions/auth";
import WFHForm from "./form/wfh-form";

export default function WorkFromHomeForm() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const u = await checkAuth();
      setUser(u);
    };
    fetchUser();
  }, []);

  if (!user) return <p className="text-muted-foreground">Đang tải...</p>;

  return <WFHForm user={user} />;
}
