"use client";

import { useState, useTransition } from "react";
import { globalSearchAction } from "@/features/dashboard/search.actions";
import type { SearchHit } from "@/features/dashboard/search.service";
import { SearchInput } from "./_components/search-input";
import { SearchResultList } from "./_components/search-result-list";

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
        setError(result.message);
        setHits([]);
        return;
      }
      setError(null);
      setHits(result.data);
    });
  }

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length >= 2;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Pacientes, avaliações e evoluções
        </p>
      </div>

      <SearchInput value={query} onChange={run} />

      {error && <p className="text-sm text-destructive">{error}</p>}
      {pending && hasQuery && (
        <p className="text-sm text-muted-foreground">A buscar…</p>
      )}

      {!pending && hasQuery && hits.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">Nenhum resultado.</p>
      )}

      <SearchResultList hits={hits} />
    </div>
  );
}
