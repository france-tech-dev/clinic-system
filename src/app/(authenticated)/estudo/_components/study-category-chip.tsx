"use client";

import { cn } from "@/shared/lib/utils";

export function StudyCategoryChip({
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
        active
          ? "border-transparent text-white"
          : "border-border text-muted-foreground hover:border-foreground/30",
      )}
      style={active ? { background: color } : undefined}
    >
      {label}
    </button>
  );
}
