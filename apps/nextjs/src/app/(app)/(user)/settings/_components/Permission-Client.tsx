"use client";

import { useEffect, useState } from "react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { toast } from "@acme/ui/toast";

import { useTRPC } from "~/trpc/react";
import { PermissionTable } from "./PermissionTable";
import { RoleSelector } from "./RoleSelector";
import { SelectAllButtons } from "./SelectAllButtons";

// tam thoi de mac dinh (khong co role nao)
// export const DEFAULT_ROLE_ID = "00000000-0000-0000-0000-000000000000";
const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

export default function Permissions() {
  const trpc = useTRPC();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [permissions, setPermissions] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: roles } = useSuspenseQuery(trpc.role.getAll.queryOptions());

  useEffect(() => {
    if (roles.length && !selectedRole) {
      setSelectedRole(roles[0]?.id!);
    }
  }, [roles, selectedRole]);

  const { data: allActions } = useSuspenseQuery(
    trpc.permission.getAllActions.queryOptions(),
  );

  const opts = trpc.permission.getPermissionsByRoleId.queryOptions({
    roleId: selectedRole || ZERO_UUID,
  });
  const { data: rolePerms } = useSuspenseQuery({
    queryKey: opts.queryKey,
    queryFn: opts.queryFn,
  });

  useEffect(() => {
    if (!rolePerms) return;
    const init: typeof permissions = {};
    rolePerms.permissions.forEach((p) => {
      if (!p.module || !p.action) return;
      init[p.module] ??= {};
      const modulePerms = init[p.module];
      if (!modulePerms) return;
      modulePerms[p.action] = p.allow ?? false;
    });
    setPermissions(init);
  }, [rolePerms, selectedRole]);

  const handleToggle = (module: string, action: string) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: { ...prev[module], [action]: !prev[module]?.[action] },
    }));
  };

  const handleSelectAll = () => {
    const all: typeof permissions = {};
    allActions.forEach((p) => {
      if (!p.module || !p.action) return;
      const moduleKey = p.module;
      const actionKey = p.action;
      all[moduleKey] ??= {};
      all[moduleKey][actionKey] = true;
    });
    setPermissions(all);
  };

  const handleDeselectAll = () => setPermissions({});

  const save = useMutation(
    trpc.permission.saveActions.mutationOptions({
      onSuccess: () => toast.success("Lưu quyền thành công!"),
      onError: (err) => toast.error(err.message),
    }),
  );

  const handleSave = async () => {
    if (!selectedRole) return;
    setIsSaving(true);
    const payload = Object.entries(permissions).flatMap(([mod, actions]) =>
      Object.entries(actions).map(([act, allow]) => ({
        module: mod,
        action: act,
        type: "query" as const,
        allow,
      })),
    );
    await save.mutateAsync({ roleId: selectedRole, actions: payload });
    setIsSaving(false);
  };

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Quản lý vai trò & quyền</CardTitle>
        <CardDescription>
          Tạo, chỉnh sửa và quản lý quyền truy cập.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RoleSelector
          roles={roles}
          selected={selectedRole}
          onSelect={setSelectedRole}
        />
        {selectedRole && allActions && rolePerms && (
          <>
            <SelectAllButtons
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />
            <PermissionTable
              allActions={allActions}
              state={permissions}
              onToggle={handleToggle}
            />
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Đang lưu..." : "Cập nhật quyền hạn"}
        </Button>
      </CardFooter>
    </Card>
  );
}
