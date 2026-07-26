"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
  createEvaluationAction,
  updateEvaluationAction,
} from "@/features/patient/patient.actions";
import {
  evaluationFormSchema,
  updateEvaluationSchema,
} from "@/features/patient/patient.schema";
import type { EvaluationDTO } from "@/features/patient/patient.types";
import { EVALUATION_DOMAINS } from "@/shared/constants/evaluation-domains";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";
import { EvaluationFormClinicalFields } from "./evaluation-form/evaluation-form-clinical-fields";
import { EvaluationFormDomainsSection } from "./evaluation-form/evaluation-form-domains-section";
import { EvaluationFormMetaFields } from "./evaluation-form/evaluation-form-meta-fields";
import { EvaluationFormPlanFields } from "./evaluation-form/evaluation-form-plan-fields";
import type { EvaluationDialogValues } from "./evaluation-form/evaluation-form-types";

export type { EvaluationDialogValues };

function defaultDomains() {
  return EVALUATION_DOMAINS.map((c) => ({
    categoryId: c.id,
    score: 2,
    note: "",
  }));
}

function buildDefaults(
  patientId: string,
  initial: EvaluationDTO | null,
): EvaluationDialogValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    ...(initial ? { id: initial.id } : {}),
    patientId,
    tipo: initial?.tipo ?? "Inicial",
    date: initial?.date ?? today,
    queixa: initial?.queixa ?? "",
    historia: initial?.historia ?? "",
    domains: initial?.domains ?? defaultDomains(),
    objetivos: initial?.objetivos ?? "",
    condutas: initial?.condutas ?? "",
    diagnostico: initial?.diagnostico ?? "",
    encaminhadoPor: initial?.encaminhadoPor ?? "",
    contextoFamiliar: initial?.contextoFamiliar ?? "",
    nivelPrevio: initial?.nivelPrevio ?? "",
    medicacoes: initial?.medicacoes ?? "",
    precaucoes: initial?.precaucoes ?? "",
    equipamentos: initial?.equipamentos ?? "",
    frequencia: initial?.frequencia ?? "",
    criteriosAlta: initial?.criteriosAlta ?? "",
  };
}

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
  const form = useForm<EvaluationDialogValues>({
    resolver: zodResolver(
      initial ? updateEvaluationSchema : evaluationFormSchema,
    ) as Resolver<EvaluationDialogValues>,
    defaultValues: buildDefaults(patientId, initial),
  });

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset(buildDefaults(patientId, initial));
    }
    onOpenChange(next);
  }

  function onSubmit(data: EvaluationDialogValues) {
    startTransition(async () => {
      const payload = {
        patientId: data.patientId,
        tipo: data.tipo,
        date: data.date,
        queixa: data.queixa,
        historia: data.historia,
        domains: data.domains,
        objetivos: data.objetivos,
        condutas: data.condutas,
        diagnostico: data.diagnostico,
        encaminhadoPor: data.encaminhadoPor,
        contextoFamiliar: data.contextoFamiliar,
        nivelPrevio: data.nivelPrevio,
        medicacoes: data.medicacoes,
        precaucoes: data.precaucoes,
        equipamentos: data.equipamentos,
        frequencia: data.frequencia,
        criteriosAlta: data.criteriosAlta,
      };
      const result = initial
        ? await updateEvaluationAction({ id: initial.id, ...payload })
        : await createEvaluationAction(payload);
      if (!result.success) {
        applyActionFieldErrors(form.setError, result.fieldErrors);
        toast.error(result.error);
        return;
      }
      toast.success(initial ? "Avaliação atualizada" : "Avaliação registrada");
      onSave(result.data, !!initial);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {initial ? "Editar avaliação" : "Nova avaliação"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="evaluation-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-3"
          >
            <EvaluationFormMetaFields />
            <EvaluationFormClinicalFields />
            <EvaluationFormDomainsSection />
            <EvaluationFormPlanFields />
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="evaluation-form" disabled={pending}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
