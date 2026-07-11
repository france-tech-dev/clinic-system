import Link from "next/link";
import type { SearchHit } from "@/features/dashboard/search.service";
import { SEARCH_KIND_LABEL } from "./search-labels";

export function SearchResultList({ hits }: { hits: SearchHit[] }) {
  if (hits.length === 0) return null;

  return (
    <ul className="max-w-xl divide-y divide-border rounded-md border border-border bg-card">
      {hits.map((h) => (
        <li key={`${h.kind}-${h.id}`}>
          <Link
            href={h.href}
            className="block px-4 py-3 transition-colors hover:bg-muted/50"
          >
            <p className="font-mono text-[0.625rem] tracking-wide text-muted-foreground uppercase">
              {SEARCH_KIND_LABEL[h.kind]}
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
  );
}
