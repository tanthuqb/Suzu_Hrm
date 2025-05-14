"use client";

import type { AuthUser } from "@acme/db";

import WFHForm from "./form/wfh-form";

export default function WorkFromHomeForm({ user }: { user: AuthUser }) {
  return <WFHForm user={user} />;
}
