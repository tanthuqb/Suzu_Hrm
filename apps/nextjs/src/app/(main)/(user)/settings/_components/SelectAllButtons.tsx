"use client";

import { Button } from "@acme/ui/button";

interface SelectAllButtonsProps {
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function SelectAllButtons({
  onSelectAll,
  onDeselectAll,
}: SelectAllButtonsProps) {
  return (
    <div className="mb-2 flex justify-end gap-4">
      <Button variant="default" size="sm" onClick={onSelectAll}>
        Chọn tất cả
      </Button>
      <Button variant="destructive" size="sm" onClick={onDeselectAll}>
        Bỏ chọn tất cả
      </Button>
    </div>
  );
}
