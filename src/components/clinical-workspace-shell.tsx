import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/shared/lib/utils";

export type ClinicalSectionNavItem = {
  id: string;
  label: string;
  meta?: ReactNode;
};

/**
 * Barra de acções do workspace: Cancelar + Salvar sempre visíveis.
 * Opcional `extra` à esquerda do Salvar (ex.: Relatório PDF).
 */
export function ClinicalWorkspaceActions({
  onCancel,
  onSave,
  saveLabel = "Salvar",
  cancelLabel = "Cancelar",
  pending = false,
  saveDisabled,
  saveType = "button",
  saveForm,
  extra,
}: {
  onCancel: () => void;
  onSave?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  saveDisabled?: boolean;
  saveType?: "button" | "submit";
  saveForm?: string;
  extra?: ReactNode;
}) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={pending}
      >
        {cancelLabel}
      </Button>
      {extra}
      <Button
        type={saveType}
        form={saveForm}
        onClick={saveType === "submit" ? undefined : onSave}
        disabled={pending || saveDisabled}
      >
        {pending ? <Spinner data-icon="inline-start" /> : null}
        {saveLabel}
      </Button>
    </>
  );
}

export function ClinicalWorkspaceFooter({ children }: { children: ReactNode }) {
  return (
    <div className="no-print flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-background pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]">
      {children}
    </div>
  );
}

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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
        <nav
          aria-label={navLabel}
          className="no-print flex gap-1.5 overflow-x-auto pb-1 lg:min-h-0 lg:flex-col lg:overflow-y-auto lg:pb-0"
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

        <div className="min-h-0 min-w-0 overflow-y-auto pb-4">{children}</div>
      </div>
      {footer ? (
        <ClinicalWorkspaceFooter>{footer}</ClinicalWorkspaceFooter>
      ) : null}
    </div>
  );
}
