"use client";

import { cn } from "@/shared/lib/utils";

export function CategoryChip({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground",
      )}
      style={{
        borderColor: active ? color : undefined,
        background: active ? `${color}22` : undefined,
      }}
    >
      {label}
    </button>
  );
}
