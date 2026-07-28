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
  createClinicalEvaluationAction,
  updateClinicalEvaluationAction,
} from "@/features/patient/patient.actions";
import {
  clinicalEvaluationFormSchema,
  updateClinicalEvaluationSchema,
} from "@/features/patient/patient.schema";
import type { ClinicalEvaluationDTO } from "@/features/patient/patient.types";
import { CLINICAL_EVALUATION_DOMAINS } from "@/shared/constants/clinical-evaluation-domains";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";
import { ClinicalEvaluationFormClinicalFields } from "./clinical-evaluation-form/clinical-evaluation-form-clinical-fields";
import { ClinicalEvaluationFormDomainsSection } from "./clinical-evaluation-form/clinical-evaluation-form-domains-section";
import { ClinicalEvaluationFormMetaFields } from "./clinical-evaluation-form/clinical-evaluation-form-meta-fields";
import { ClinicalEvaluationFormPlanFields } from "./clinical-evaluation-form/clinical-evaluation-form-plan-fields";
import type { ClinicalEvaluationDialogValues } from "./clinical-evaluation-form/clinical-evaluation-form-types";

export type { ClinicalEvaluationDialogValues };

function defaultDomains() {
  return CLINICAL_EVALUATION_DOMAINS.map((c) => ({
    categoryId: c.id,
    score: 2,
    note: "",
  }));
}

function buildDefaults(
  patientId: string,
  initial: ClinicalEvaluationDTO | null,
): ClinicalEvaluationDialogValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    ...(initial ? { id: initial.id } : {}),
    patientId,
    type: initial?.type ?? "Initial",
    date: initial?.date ?? today,
    complaint: initial?.complaint ?? "",
    history: initial?.history ?? "",
    domains: initial?.domains ?? defaultDomains(),
    goals: initial?.goals ?? "",
    interventions: initial?.interventions ?? "",
    diagnosis: initial?.diagnosis ?? "",
    referredBy: initial?.referredBy ?? "",
    familyContext: initial?.familyContext ?? "",
    previousLevel: initial?.previousLevel ?? "",
    medications: initial?.medications ?? "",
    precautions: initial?.precautions ?? "",
    equipment: initial?.equipment ?? "",
    frequency: initial?.frequency ?? "",
    dischargeCriteria: initial?.dischargeCriteria ?? "",
  };
}

export function ClinicalEvaluationFormDialog({
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
  initial: ClinicalEvaluationDTO | null;
  pending: boolean;
  onSave: (ev: ClinicalEvaluationDTO, isEdit: boolean) => void;
  startTransition: (fn: () => void) => void;
}) {
  const form = useForm<ClinicalEvaluationDialogValues>({
    resolver: zodResolver(
      initial ? updateClinicalEvaluationSchema : clinicalEvaluationFormSchema,
    ) as Resolver<ClinicalEvaluationDialogValues>,
    defaultValues: buildDefaults(patientId, initial),
  });

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset(buildDefaults(patientId, initial));
    }
    onOpenChange(next);
  }

  function onSubmit(data: ClinicalEvaluationDialogValues) {
    startTransition(async () => {
      const payload = {
        patientId: data.patientId,
        type: data.type,
        date: data.date,
        complaint: data.complaint,
        history: data.history,
        domains: data.domains,
        goals: data.goals,
        interventions: data.interventions,
        diagnosis: data.diagnosis,
        referredBy: data.referredBy,
        familyContext: data.familyContext,
        previousLevel: data.previousLevel,
        medications: data.medications,
        precautions: data.precautions,
        equipment: data.equipment,
        frequency: data.frequency,
        dischargeCriteria: data.dischargeCriteria,
      };
      const result = initial
        ? await updateClinicalEvaluationAction({ id: initial.id, ...payload })
        : await createClinicalEvaluationAction(payload);
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
            <ClinicalEvaluationFormMetaFields />
            <ClinicalEvaluationFormClinicalFields />
            <ClinicalEvaluationFormDomainsSection />
            <ClinicalEvaluationFormPlanFields />
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
