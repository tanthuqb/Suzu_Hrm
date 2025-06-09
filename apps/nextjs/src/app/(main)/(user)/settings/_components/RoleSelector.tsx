"use client";

import type { RoleRecord } from "@acme/db/schema";
import { Label } from "@acme/ui/label";
import { RadioGroup, RadioGroupItem } from "@acme/ui/radio-group";

interface RoleSelectorProps {
  roles: RoleRecord[];
  selected: string;
  onSelect: (roleId: string) => void;
}

export function RoleSelector({ roles, selected, onSelect }: RoleSelectorProps) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-medium">Chọn vai trò để cấu hình</h3>
      <RadioGroup
        value={selected}
        onValueChange={onSelect}
        className="space-y-2"
      >
        {roles &&
          roles.length > 0 &&
          roles.map((role) => (
            <div key={role.id} className="flex items-center gap-2">
              <RadioGroupItem value={role.id} id={role.id} />
              <Label htmlFor={role.id}>{role.name}</Label>
            </div>
          ))}
      </RadioGroup>
    </div>
  );
}
