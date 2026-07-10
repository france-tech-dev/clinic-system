"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { globalSearchAction } from "@/features/dashboard/search.actions";
import type { SearchHit } from "@/features/dashboard/search.service";

const KIND_LABEL: Record<SearchHit["kind"], string> = {
  patient: "Paciente",
  exercise: "Atividade",
  evaluation: "Avaliação",
  session: "Evolução",
  study: "Estudo",
};

export function BuscarClient() {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setHits([]);
      setError(null);
      return;
    }
    startTransition(async () => {
      const result = await globalSearchAction(value);
      if (!result.success) {
        setError(result.error);
        setHits([]);
        return;
      }
      setError(null);
      setHits(result.data);
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Buscar</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pacientes, atividades, avaliações, evoluções e notas de estudo
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          autoFocus
          placeholder="Nome do paciente, conteúdo de avaliação, atividade…"
          value={query}
          onChange={(e) => run(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {pending && query.trim().length >= 2 && (
        <p className="text-sm text-muted-foreground">A buscar…</p>
      )}

      {!pending && query.trim().length >= 2 && hits.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">Nenhum resultado.</p>
      )}

      <ul className="max-w-xl divide-y divide-border rounded-md border border-border bg-card">
        {hits.map((h) => (
          <li key={`${h.kind}-${h.id}`}>
            <Link
              href={h.href}
              className="block px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <p className="font-mono text-[0.625rem] tracking-wide text-muted-foreground uppercase">
                {KIND_LABEL[h.kind]}
              </p>
              <p className="font-medium">{h.title}</p>
              {h.subtitle && (
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {h.subtitle}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
