import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export type ClinicalSectionNavItem = {
  id: string;
  /** Rótulo curto no índice (ex.: tick / código do domínio). */
  label: string;
  /** Conteúdo opcional à direita do rótulo (ex.: score). */
  meta?: ReactNode;
};

/**
 * Shell de workspace clínico denso: índice de secções + painel activo.
 * Desktop: 2 colunas. Mobile: índice horizontal scrollável.
 * Preferir para anamneses, roteiros e protocolos multi-secção — não hubs/listas.
 */
export function ClinicalWorkspaceShell({
  navLabel,
  items,
  activeId,
  onSelect,
  children,
  footer,
}: {
  navLabel: string;
  items: ClinicalSectionNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
      <nav
        aria-label={navLabel}
        className="no-print flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
      >
        {items.map((item, idx) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md border px-2.5 py-1.5 text-left transition-colors lg:w-full",
                active
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              <span className="font-mono text-[0.625rem] tracking-wide opacity-70">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 text-xs font-medium">
                {item.label}
              </span>
              {item.meta ? (
                <span className="shrink-0 text-[0.625rem] text-muted-foreground">
                  {item.meta}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="flex min-w-0 flex-col gap-4">
        {children}
        {footer ? (
          <div className="no-print sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-background/80 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] backdrop-blur">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
