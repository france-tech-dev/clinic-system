import { cn } from "@/shared/lib/utils";
import {
  PATIENT_DETAIL_TABS,
  type PatientDetailTab,
} from "./patient-detail-types";

export function PatientDetailTabs({
  tab,
  onTabChange,
}: {
  tab: PatientDetailTab;
  onTabChange: (tab: PatientDetailTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Secções do paciente"
      className="no-print -mx-1 flex gap-1 overflow-x-auto overscroll-x-contain border-b border-border px-1 sm:mx-0 sm:gap-4 sm:px-0"
    >
      {PATIENT_DETAIL_TABS.map(([id, label]) => {
        const selected = tab === id;
        const shortLabel = id === "links-publicos" ? "Links" : label;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            id={`patient-tab-${id}`}
            aria-selected={selected}
            aria-controls={`patient-tabpanel-${id}`}
            aria-label={label}
            tabIndex={selected ? 0 : -1}
            onClick={() => onTabChange(id)}
            className={cn(
              "shrink-0 border-b-2 px-2 pb-2 text-sm font-medium sm:px-0",
              selected
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground",
            )}
          >
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
