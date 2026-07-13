import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EvaluationFormClinicalFields({
  queixa,
  onQueixaChange,
  historia,
  onHistoriaChange,
  contextoFamiliar,
  onContextoFamiliarChange,
  nivelPrevio,
  onNivelPrevioChange,
  medicacoes,
  onMedicacoesChange,
  precaucoes,
  onPrecaucoesChange,
}: {
  queixa: string;
  onQueixaChange: (value: string) => void;
  historia: string;
  onHistoriaChange: (value: string) => void;
  contextoFamiliar: string;
  onContextoFamiliarChange: (value: string) => void;
  nivelPrevio: string;
  onNivelPrevioChange: (value: string) => void;
  medicacoes: string;
  onMedicacoesChange: (value: string) => void;
  precaucoes: string;
  onPrecaucoesChange: (value: string) => void;
}) {
  return (
    <>
      <div className="grid gap-1.5">
        <Label>Queixa principal / motivo</Label>
        <Textarea rows={2} value={queixa} onChange={(e) => onQueixaChange(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label>História clínica / ocupacional</Label>
        <Textarea rows={3} value={historia} onChange={(e) => onHistoriaChange(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label>Contexto familiar e social</Label>
        <Textarea
          rows={2}
          value={contextoFamiliar}
          onChange={(e) => onContextoFamiliarChange(e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Nível de função prévio</Label>
        <Textarea rows={2} value={nivelPrevio} onChange={(e) => onNivelPrevioChange(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Medicações em uso</Label>
          <Input value={medicacoes} onChange={(e) => onMedicacoesChange(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label>Precauções / contraindicações</Label>
          <Input value={precaucoes} onChange={(e) => onPrecaucoesChange(e.target.value)} />
        </div>
      </div>
    </>
  );
}
