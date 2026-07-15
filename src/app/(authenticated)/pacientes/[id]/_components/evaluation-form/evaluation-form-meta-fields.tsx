import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EvaluationFormMetaFields({
  tipo,
  onTipoChange,
  date,
  onDateChange,
  diagnostico,
  onDiagnosticoChange,
  encaminhadoPor,
  onEncaminhadoPorChange,
}: {
  tipo: string;
  onTipoChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  diagnostico: string;
  onDiagnosticoChange: (value: string) => void;
  encaminhadoPor: string;
  onEncaminhadoPorChange: (value: string) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Tipo</Label>
          <Select value={tipo} onValueChange={(v) => onTipoChange(v ?? tipo)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inicial">Avaliação inicial</SelectItem>
              <SelectItem value="Reavaliação">Reavaliação</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Data</Label>
          <DatePicker value={date} onChange={onDateChange} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Diagnóstico / CID</Label>
          <Input
            value={diagnostico}
            onChange={(e) => onDiagnosticoChange(e.target.value)}
            placeholder="Ex: G80 – Paralisia cerebral"
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Encaminhado por</Label>
          <Input
            value={encaminhadoPor}
            onChange={(e) => onEncaminhadoPorChange(e.target.value)}
            placeholder="Médico, escola, família…"
          />
        </div>
      </div>
    </>
  );
}
