"use client";

import { useEffect, useState, useTransition } from "react";
import { useMutation } from "@tanstack/react-query";

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

import type { PermissionAction, RolePermission } from "~/libs/data/permisions";
import type { Role } from "~/libs/data/roles";
import { PermissionTable } from "./PermissionTable";
import { RoleSelector } from "./RoleSelector";
import { SelectAllButtons } from "./SelectAllButtons";

export default function Permissions({
  roles,
  permissions: allActions,
}: {
  roles: Role[];
  permissions: PermissionAction[];
}) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [rolePerms, setRolePerms] = useState<RolePermission | null>(null);
  const [isSaving, startTransition] = useTransition();
  const [state, setState] = useState<Record<string, Record<string, boolean>>>(
    {},
  );

  // Gán role mặc định
  useEffect(() => {
    if (!selectedRole) {
      if (roles.length && !selectedRole && roles[0]) {
        setSelectedRole(roles[0].id);
      } else {
        const defaultState: typeof state = {};
        allActions.forEach((p) => {
          (defaultState[p.module] ??= {})[p.action] = p.allow ?? false;
        });
        setState(defaultState);
      }
    }
  }, [roles, selectedRole, allActions]);

  // Lấy quyền theo role khi selectedRole thay đổi
  useEffect(() => {
    if (!selectedRole) return;

    fetch(`/api/permissions/${selectedRole}`)
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi HTTP khi lấy quyền");
        return res.json();
      })
      .then((data: RolePermission) => {
        setRolePerms(data);
        const init: typeof state = {};
        data.permissions.forEach((p) => {
          (init[p.module] ??= {})[p.action] = p.allow ?? false;
        });
        setState(init);
      })
      .catch((err) => {
        console.error("❌ Lỗi lấy permission theo role:", err);
        toast.error("Không thể tải quyền cho vai trò được chọn.");
      });
  }, [selectedRole]);

  const handleToggle = (module: string, action: string) => {
    setState((prev) => ({
      ...prev,
      [module]: { ...prev[module], [action]: !prev[module]?.[action] },
    }));
  };

  const handleSelectAll = () => {
    const all: typeof state = {};
    allActions.forEach((p) => {
      all[p.module] ??= {};
      (all[p.module] ??= {})[p.action] = p.allow ?? false;
    });
    setState(all);
  };

  const handleDeselectAll = () => setState({});

  const handleSave = () => {
    if (!selectedRole) return;
    startTransition(async () => {
      const payload: PermissionAction[] = Object.entries(state).flatMap(
        ([mod, actions]) =>
          Object.entries(actions).map(([act, allow]) => ({
            module: mod,
            action: act,
            type: "query", // hoặc giữ type từ allActions nếu cần
            allow,
          })),
      );

      const res = await fetch("/api/permissions", {
        method: "POST",
        body: JSON.stringify({ roleId: selectedRole, actions: payload }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.ok) toast.success("✅ Lưu quyền thành công!");
      else toast.error(`❌ ${data.error}`);
    });
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
        {selectedRole && allActions.length > 0 && rolePerms && (
          <>
            <SelectAllButtons
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />
            <PermissionTable
              allActions={allActions}
              state={state}
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
