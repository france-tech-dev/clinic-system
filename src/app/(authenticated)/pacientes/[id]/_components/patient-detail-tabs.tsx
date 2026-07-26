import { cn } from "@/shared/lib/utils";
import {
  PATIENT_DETAIL_TABS,
  type PatientDetailTab,
} from "./patient-detail-types";

export function PatientDetailTabs({
  tab,
  onTabChange,
  showRoteiros,
}: {
  tab: PatientDetailTab;
  onTabChange: (tab: PatientDetailTab) => void;
  showRoteiros: boolean;
}) {
  const tabs = PATIENT_DETAIL_TABS.filter(
    ([id]) => id !== "roteiros" || showRoteiros,
  );

  return (
    <div className="no-print flex gap-4 overflow-x-auto border-b border-border">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onTabChange(id)}
          className={cn(
            "shrink-0 border-b-2 pb-2 text-sm font-medium",
            tab === id
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
