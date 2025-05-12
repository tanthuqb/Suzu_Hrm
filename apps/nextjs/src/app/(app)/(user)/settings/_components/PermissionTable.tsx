"use client";

import { Checkbox } from "@acme/ui/checkbox";

export interface AllAction {
  module: string;
  action: string;
  type: "query" | "mutation" | "subscription";
}

interface PermissionTableProps {
  allActions: AllAction[];
  state: Record<string, Record<string, boolean>>;
  onToggle: (module: string, action: string) => void;
}

export function PermissionTable({
  allActions,
  state,
  onToggle,
}: PermissionTableProps) {
  return (
    <table className="min-w-full border text-left">
      <thead>
        <tr>
          <th className="px-4 py-2">Module</th>
          <th className="px-4 py-2">Action</th>
          <th className="px-4 py-2">Cho phép</th>
        </tr>
      </thead>
      <tbody>
        {allActions.map((perm) => (
          <tr
            key={`${perm.module}-${perm.action}`}
            className="hover:bg-gray-50"
          >
            <td className="px-4 py-2">{perm.module}</td>
            <td className="px-4 py-2">{perm.action}</td>
            <td className="px-4 py-2 text-center">
              <Checkbox
                checked={state[perm.module]?.[perm.action] ?? false}
                onCheckedChange={() => onToggle(perm.module, perm.action)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
