"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createEvaluationAction,
  updateEvaluationAction,
} from "@/features/patient/patient.actions";
import type { EvaluationDTO } from "@/features/patient/patient.types";
import { EVALUATION_DOMAINS } from "@/shared/constants/evaluation-domains";
import { EvaluationFormClinicalFields } from "./evaluation-form/evaluation-form-clinical-fields";
import { EvaluationFormDomainsSection } from "./evaluation-form/evaluation-form-domains-section";
import { EvaluationFormMetaFields } from "./evaluation-form/evaluation-form-meta-fields";
import { EvaluationFormPlanFields } from "./evaluation-form/evaluation-form-plan-fields";

export function EvaluationFormDialog({
  open,
  onOpenChange,
  patientId,
  initial,
  pending,
  onSave,
  startTransition,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  patientId: string;
  initial: EvaluationDTO | null;
  pending: boolean;
  onSave: (ev: EvaluationDTO, isEdit: boolean) => void;
  startTransition: (fn: () => void) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [tipo, setTipo] = useState(initial?.tipo ?? "Inicial");
  const [date, setDate] = useState(initial?.date ?? today);
  const [diagnostico, setDiagnostico] = useState(initial?.diagnostico ?? "");
  const [encaminhadoPor, setEncaminhadoPor] = useState(
    initial?.encaminhadoPor ?? "",
  );
  const [queixa, setQueixa] = useState(initial?.queixa ?? "");
  const [historia, setHistoria] = useState(initial?.historia ?? "");
  const [contextoFamiliar, setContextoFamiliar] = useState(
    initial?.contextoFamiliar ?? "",
  );
  const [nivelPrevio, setNivelPrevio] = useState(initial?.nivelPrevio ?? "");
  const [medicacoes, setMedicacoes] = useState(initial?.medicacoes ?? "");
  const [precaucoes, setPrecaucoes] = useState(initial?.precaucoes ?? "");
  const [equipamentos, setEquipamentos] = useState(initial?.equipamentos ?? "");
  const [objetivos, setObjetivos] = useState(initial?.objetivos ?? "");
  const [condutas, setCondutas] = useState(initial?.condutas ?? "");
  const [frequencia, setFrequencia] = useState(initial?.frequencia ?? "");
  const [criteriosAlta, setCriteriosAlta] = useState(
    initial?.criteriosAlta ?? "",
  );
  const [domains, setDomains] = useState(
    initial?.domains ??
      EVALUATION_DOMAINS.map((c) => ({
        categoryId: c.id,
        score: 2,
        note: "",
      })),
  );

  function submit() {
    startTransition(async () => {
      const payload = {
        patientId,
        tipo,
        date,
        queixa,
        historia,
        domains,
        objetivos,
        condutas,
        diagnostico,
        encaminhadoPor,
        contextoFamiliar,
        nivelPrevio,
        medicacoes,
        precaucoes,
        equipamentos,
        frequencia,
        criteriosAlta,
      };
      const result = initial
        ? await updateEvaluationAction({ id: initial.id, ...payload })
        : await createEvaluationAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(initial ? "Avaliação atualizada" : "Avaliação registrada");
      onSave(result.data, !!initial);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {initial ? "Editar avaliação" : "Nova avaliação"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <EvaluationFormMetaFields
            tipo={tipo}
            onTipoChange={setTipo}
            date={date}
            onDateChange={setDate}
            diagnostico={diagnostico}
            onDiagnosticoChange={setDiagnostico}
            encaminhadoPor={encaminhadoPor}
            onEncaminhadoPorChange={setEncaminhadoPor}
          />
          <EvaluationFormClinicalFields
            queixa={queixa}
            onQueixaChange={setQueixa}
            historia={historia}
            onHistoriaChange={setHistoria}
            contextoFamiliar={contextoFamiliar}
            onContextoFamiliarChange={setContextoFamiliar}
            nivelPrevio={nivelPrevio}
            onNivelPrevioChange={setNivelPrevio}
            medicacoes={medicacoes}
            onMedicacoesChange={setMedicacoes}
            precaucoes={precaucoes}
            onPrecaucoesChange={setPrecaucoes}
          />
          <EvaluationFormDomainsSection
            domains={domains}
            onDomainsChange={setDomains}
          />
          <EvaluationFormPlanFields
            equipamentos={equipamentos}
            onEquipamentosChange={setEquipamentos}
            objetivos={objetivos}
            onObjetivosChange={setObjetivos}
            condutas={condutas}
            onCondutasChange={setCondutas}
            frequencia={frequencia}
            onFrequenciaChange={setFrequencia}
            criteriosAlta={criteriosAlta}
            onCriteriosAltaChange={setCriteriosAlta}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={pending} onClick={submit}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
