import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EvaluationFormPlanFields({
  equipamentos,
  onEquipamentosChange,
  objetivos,
  onObjetivosChange,
  condutas,
  onCondutasChange,
  frequencia,
  onFrequenciaChange,
  criteriosAlta,
  onCriteriosAltaChange,
}: {
  equipamentos: string;
  onEquipamentosChange: (value: string) => void;
  objetivos: string;
  onObjetivosChange: (value: string) => void;
  condutas: string;
  onCondutasChange: (value: string) => void;
  frequencia: string;
  onFrequenciaChange: (value: string) => void;
  criteriosAlta: string;
  onCriteriosAltaChange: (value: string) => void;
}) {
  return (
    <>
      <div className="grid gap-1.5">
        <Label>Uso de equipamentos / órteses</Label>
        <Input value={equipamentos} onChange={(e) => onEquipamentosChange(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label>Objetivos terapêuticos</Label>
        <Textarea rows={3} value={objetivos} onChange={(e) => onObjetivosChange(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label>Condutas / plano de intervenção</Label>
        <Textarea rows={3} value={condutas} onChange={(e) => onCondutasChange(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Frequência proposta</Label>
          <Input
            value={frequencia}
            onChange={(e) => onFrequenciaChange(e.target.value)}
            placeholder="Ex: 2x por semana, 50 min"
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Critérios de alta</Label>
          <Input value={criteriosAlta} onChange={(e) => onCriteriosAltaChange(e.target.value)} />
        </div>
      </div>
    </>
  );
}
