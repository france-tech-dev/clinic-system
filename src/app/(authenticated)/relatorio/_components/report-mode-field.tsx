import type { PatientReportMode } from "@/features/patient/_lib/pdf/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REPORT_MODES } from "./report-mode-options";

export function ReportModeField({
  mode,
  previewTitle,
  onModeChange,
}: {
  mode: PatientReportMode;
  previewTitle: string;
  onModeChange: (mode: PatientReportMode) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="report-mode">Tipo de relatório</Label>
      <Select
        value={mode}
        onValueChange={(value) => onModeChange(value as PatientReportMode)}
      >
        <SelectTrigger id="report-mode" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {REPORT_MODES.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">{previewTitle}</p>
    </div>
  );
}
