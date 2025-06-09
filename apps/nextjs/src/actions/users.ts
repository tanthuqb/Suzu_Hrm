"use server";

import { adminAuthClient, createServerClient } from "@acme/supabase";

const supabase = await createServerClient();
export const updateUser = async (id: string, payload: Partial<any>) => {
  const { data, error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

export const deleteUser = async (id: string) => {
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const importUsers = async (input: any[]) => {
  const admin = adminAuthClient();
  const allowedDomains = ["@suzu.group", "@suzu.edu.vn"];
  const isAllowed = (email: string) =>
    allowedDomains.some((domain) => email.endsWith(domain));

  const validUsers = input.filter((user) => isAllowed(user.email));
  const imported: any[] = [];

  for (const user of validUsers) {
    const { data: existing, error } = await admin
      .from("auth.users")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    let authId = existing?.id;

    if (!authId) {
      const { data, error: createErr } = await admin.auth.admin.createUser({
        email: user.email,
        password: "Suzu@" + Math.floor(100000 + Math.random() * 900000),
        email_confirm: true,
      });
      if (createErr || !data.user.id) continue;
      authId = data.user.id;
    }

    imported.push({
      id: authId,
      ...user,
      name: user.name ?? `${user.firstName} ${user.lastName}`,
      employeeCode: user.employeeCode ?? "",
      departmentId: "",
      positionId: "",
      roleId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await supabase
    .from("users")
    .delete()
    .in(
      "email",
      imported.map((u) => u.email),
    );
  if (imported.length) {
    await supabase.from("users").insert(imported);
  }

  return {
    insertedCount: imported.length,
    ignoredCount: input.length - imported.length,
  };
};
