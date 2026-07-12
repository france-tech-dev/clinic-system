import type { EvaluationDTO } from "@/features/patient/patient.types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateBR } from "@/shared/lib/format-date-br";

export function EvaluationSelectField({
  patientId,
  evaluationId,
  evaluations,
  pending,
  onEvaluationChange,
}: {
  patientId: string;
  evaluationId: string;
  evaluations: EvaluationDTO[];
  pending: boolean;
  onEvaluationChange: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="evaluation">Avaliação</Label>
      <Select
        value={evaluationId}
        onValueChange={onEvaluationChange}
        disabled={!patientId || pending}
      >
        <SelectTrigger id="evaluation" className="w-full">
          <SelectValue
            placeholder={
              patientId
                ? evaluations.length === 0
                  ? "Nenhuma avaliação registrada"
                  : "Selecione uma avaliação"
                : "Selecione um paciente primeiro"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {evaluations.length === 0 ? (
            <SelectItem value="__empty" disabled>
              {patientId
                ? "Nenhuma avaliação registrada"
                : "Selecione um paciente primeiro"}
            </SelectItem>
          ) : (
            evaluations.map((ev) => (
              <SelectItem key={ev.id} value={ev.id}>
                {formatDateBR(ev.date)} — {ev.tipo || "Avaliação"}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
