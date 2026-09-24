"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  dialogScrollableClassName,
  dialogScrollBodyClassName,
  dialogScrollFooterClassName,
  dialogScrollHeaderClassName,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
  createAssessmentAction,
  updateAssessmentAction,
} from "@/domains/assessment/assessment.actions";
import {
  assessmentFormSchema,
  updateAssessmentSchema,
} from "@/domains/assessment/assessment.schema";
import type { AssessmentDTO } from "@/domains/assessment/assessment.types";
import { ASSESSMENT_DOMAINS } from "@/shared/constants/assessment-domains";
import { cn } from "@/shared/lib/utils";
import { applyActionFieldErrors } from "@/shared/lib/apply-action-field-errors";
import { AssessmentFormClinicalFields } from "./assessment-form/assessment-form-clinical-fields";
import { AssessmentFormDomainsSection } from "./assessment-form/assessment-form-domains-section";
import { AssessmentFormMetaFields } from "./assessment-form/assessment-form-meta-fields";
import { AssessmentFormPlanFields } from "./assessment-form/assessment-form-plan-fields";
import type { AssessmentDialogValues } from "./assessment-form/assessment-form-types";

export type { AssessmentDialogValues };

function defaultDomains() {
  return ASSESSMENT_DOMAINS.map((c) => ({
    categoryId: c.id,
    score: 2,
    note: "",
  }));
}

function buildDefaults(
  patientId: string,
  initial: AssessmentDTO | null,
): AssessmentDialogValues {
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

export function AssessmentFormDialog({
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
  initial: AssessmentDTO | null;
  pending: boolean;
  onSave: (ev: AssessmentDTO, isEdit: boolean) => void;
  startTransition: (fn: () => void) => void;
}) {
  const form = useForm<AssessmentDialogValues>({
    resolver: zodResolver(
      initial ? updateAssessmentSchema : assessmentFormSchema,
    ) as Resolver<AssessmentDialogValues>,
    defaultValues: buildDefaults(patientId, initial),
  });

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset(buildDefaults(patientId, initial));
    }
    onOpenChange(next);
  }

  function onSubmit(data: AssessmentDialogValues) {
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
        ? await updateAssessmentAction({ id: initial.id, ...payload })
        : await createAssessmentAction(payload);
      if (!result.success) {
        applyActionFieldErrors(form.setError, result.fieldErrors);
        toast.error(result.message);
        return;
      }
      toast.success(initial ? "Avaliação atualizada" : "Avaliação registrada");
      onSave(result.data, !!initial);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(dialogScrollableClassName, "sm:max-w-2xl")}
      >
        <DialogHeader className={dialogScrollHeaderClassName}>
          <DialogTitle>
            {initial ? "Editar avaliação" : "Nova avaliação"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="assessment-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(dialogScrollBodyClassName, "grid gap-3")}
          >
            <AssessmentFormMetaFields />
            <AssessmentFormClinicalFields />
            <AssessmentFormDomainsSection />
            <AssessmentFormPlanFields />
          </form>
        </Form>

        <DialogFooter className={dialogScrollFooterClassName}>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="assessment-form" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
