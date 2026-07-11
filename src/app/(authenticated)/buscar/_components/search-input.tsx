"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative max-w-xl">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9"
        autoFocus
        placeholder="Nome do paciente, conteúdo de avaliação, atividade…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
