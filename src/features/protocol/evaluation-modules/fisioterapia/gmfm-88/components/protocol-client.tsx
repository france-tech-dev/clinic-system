"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  ClinicalWorkspaceActions,
  ClinicalWorkspaceFooter,
} from "@/components/clinical-workspace-shell";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { EntityCombobox } from "@/components/entity-combobox";
import { PatientStatus } from "@prisma/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GmfmEvaluationForm,
  type GmfmEvaluationFormValues,
} from "./evaluation-form";
import { ProtocolComparisonChart } from "@/features/protocol/evaluation-modules/_shared/protocol-comparison-chart";
import { GMFM88_PROTOCOL_ID } from "@/domains/protocol/evaluation-modules/fisioterapia/gmfm-88/template";
import {
  emptyGmfm88Scores,
  summarizeGmfm88,
  type Gmfm88Scores,
} from "@/domains/protocol/evaluation-modules/fisioterapia/gmfm-88/scoring";
import {
  compareProtocolEvaluationsAction,
  createProtocolEvaluationAction,
  deleteProtocolEvaluationAction,
  listProtocolEvaluationsAction,
  updateProtocolEvaluationAction,
} from "@/domains/protocol/protocol.actions";
import { protocolEvaluationFormSchema } from "@/domains/protocol/protocol.schema";
import type {
  ProtocolEvaluationDTO,
  ProtocolEvaluationComparisonDTO,
} from "@/domains/protocol/protocol.types";
import type { EvaluationModulePatientOption } from "@/shared/types/evaluation-module-patient";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";

function buildDefaults(
  patientId: string,
  editing: ProtocolEvaluationDTO | null,
  assessmentsLength: number,
): GmfmEvaluationFormValues {
  if (editing) {
    return {
      id: editing.id,
      patientId,
      protocolId: GMFM88_PROTOCOL_ID,
      label: editing.label,
      date: editing.date,
      notes: editing.notes,
      scores: { ...emptyGmfm88Scores(), ...editing.scores },
    };
  }
  return {
    patientId,
    protocolId: GMFM88_PROTOCOL_ID,
    label: assessmentsLength === 0 ? "Avaliação" : "Reavaliação",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    scores: emptyGmfm88Scores(),
  };
}

export function GmfmProtocolClient({
  patients,
  initialPatientId,
  initialProtocolEvaluations,
  canWrite,
}: {
  patients: EvaluationModulePatientOption[];
  initialPatientId: string | null;
  initialProtocolEvaluations: ProtocolEvaluationDTO[];
  canWrite: boolean;
}) {
  const [patientId, setPatientId] = useState(initialPatientId ?? "");
  const [assessments, setAssessments] = useState<ProtocolEvaluationDTO[]>(
    initialProtocolEvaluations,
  );
  const [baselineId, setBaselineId] = useState("");
  const [followUpId, setFollowUpId] = useState("");
  const [comparison, setComparison] =
    useState<ProtocolEvaluationComparisonDTO | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProtocolEvaluationDTO | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<GmfmEvaluationFormValues>({
    resolver: zodResolver(
      protocolEvaluationFormSchema,
    ) as Resolver<GmfmEvaluationFormValues>,
    defaultValues: buildDefaults(patientId, null, 0),
  });

  const scores =
    (useWatch({ control: form.control, name: "scores" }) as
      Gmfm88Scores | undefined) ?? emptyGmfm88Scores();
  const liveSummary = useMemo(() => summarizeGmfm88(scores), [scores]);

  const activePatients = useMemo(
    () => patients.filter((p) => p.status !== PatientStatus.DISCHARGED),
    [patients],
  );

  function loadAssessments(id: string) {
    if (!id) {
      setAssessments([]);
      setBaselineId("");
      setFollowUpId("");
      setComparison(null);
      return;
    }

    startTransition(async () => {
      const result = await listProtocolEvaluationsAction({
        patientId: id,
        protocolId: GMFM88_PROTOCOL_ID,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setAssessments(result.data);
      setBaselineId(result.data[1]?.id ?? result.data[0]?.id ?? "");
      setFollowUpId(result.data[0]?.id ?? "");
      setComparison(null);
    });
  }

  function openCreate() {
    setEditing(null);
    form.reset(buildDefaults(patientId, null, assessments.length));
    setFormOpen(true);
  }

  function openEdit(item: ProtocolEvaluationDTO) {
    setEditing(item);
    form.reset(buildDefaults(patientId, item, assessments.length));
    setFormOpen(true);
  }

  function handleFormOpenChange(next: boolean) {
    if (!next) {
      form.reset(buildDefaults(patientId, editing, assessments.length));
    }
    setFormOpen(next);
  }

  function onSubmit(data: GmfmEvaluationFormValues) {
    if (!patientId) {
      toast.error("Selecione um paciente");
      return;
    }

    startTransition(async () => {
      const payload = {
        patientId,
        protocolId: GMFM88_PROTOCOL_ID as "gmfm-88",
        label: data.label,
        date: data.date,
        notes: data.notes,
        scores: data.scores,
      };

      const result = editing
        ? await updateProtocolEvaluationAction({ id: editing.id, ...payload })
        : await createProtocolEvaluationAction(payload);

      if (!result.success) {
        applyActionFieldErrors(form.setError, result.fieldErrors);
        toast.error(result.message);
        return;
      }

      toast.success(editing ? "Avaliação atualizada" : "Avaliação registrada");
      setFormOpen(false);
      setAssessments((prev) => {
        if (editing) {
          return prev.map((a) => (a.id === result.data.id ? result.data : a));
        }
        return [result.data, ...prev];
      });
      if (!baselineId) setBaselineId(result.data.id);
      if (!followUpId) setFollowUpId(result.data.id);
      setComparison(null);
    });
  }

  function removeAssessment(id: string) {
    startTransition(async () => {
      const result = await deleteProtocolEvaluationAction({ id });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Avaliação removida");
      setAssessments((prev) => prev.filter((a) => a.id !== id));
      if (baselineId === id) setBaselineId("");
      if (followUpId === id) setFollowUpId("");
      setComparison(null);
    });
  }

  function runComparison() {
    if (!baselineId || !followUpId || baselineId === followUpId) {
      toast.error("Selecione duas avaliações diferentes");
      return;
    }

    startTransition(async () => {
      const result = await compareProtocolEvaluationsAction({
        baselineId,
        followUpId,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setComparison(result.data);
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {canWrite
          ? "GMFM-88 mede a função motora grossa em 5 domínios. Escolha o paciente, registre a pontuação (0–3 por item) e compare avaliação com reavaliação."
          : "GMFM-88 mede a função motora grossa em 5 domínios. Escolha o paciente para consultar o histórico e o comparativo."}
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Paciente</CardTitle>
          <CardDescription>
            5 domínios, 88 itens. Os resultados ficam no histórico deste
            protocolo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <EntityCombobox
            options={activePatients}
            value={patientId}
            onValueChange={(id) => {
              setPatientId(id);
              loadAssessments(id);
            }}
            placeholder="Selecione o paciente"
            emptyText="Nenhum paciente encontrado"
          />

          {patientId && canWrite ? (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={openCreate} disabled={pending}>
                <Plus className="size-4" />
                Nova avaliação GMFM-88
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {patientId && assessments.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Histórico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {a.label} — {formatDateBR(a.date)}
                    </p>
                    {a.professionalName ? (
                      <p className="text-sm text-muted-foreground">
                        {a.professionalName}
                      </p>
                    ) : null}
                    {a.summary ? (
                      <p className="text-sm text-muted-foreground">
                        Total {a.summary.totalScore}/{a.summary.maxScore} (
                        {a.summary.percent.toFixed(1)}%)
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    {canWrite ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(a)}
                          disabled={pending}
                        >
                          Editar
                        </Button>
                        <DeleteConfirmDialog
                          onConfirm={() => removeAssessment(a.id)}
                          disabled={pending}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            disabled={pending}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </DeleteConfirmDialog>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {assessments.length >= 2 ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">
                  Comparativo
                </CardTitle>
                <CardDescription>
                  Selecione avaliação inicial e reavaliação para ver evolução
                  por domínio.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid items-start gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <span className="text-sm font-medium">Avaliação base</span>
                    <Select value={baselineId} onValueChange={setBaselineId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {assessments.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.label} — {formatDateBR(a.date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <span className="text-sm font-medium">Comparar com</span>
                    <Select value={followUpId} onValueChange={setFollowUpId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {assessments.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.label} — {formatDateBR(a.date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-fit"
                  onClick={runComparison}
                  disabled={pending}
                >
                  {pending ? <Spinner data-icon="inline-start" /> : null}
                  Gerar comparativo
                </Button>

                {comparison ? (
                  <div className="space-y-4 border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground">
                      Evolução geral:{" "}
                      <span className="font-medium text-foreground">
                        {comparison.overallDeltaPercent >= 0 ? "+" : ""}
                        {comparison.overallDeltaPercent.toFixed(1)} p.p.
                      </span>{" "}
                      ({comparison.baseline.summary?.percent.toFixed(1)}% →{" "}
                      {comparison.followUp.summary?.percent.toFixed(1)}%)
                    </p>
                    <ProtocolComparisonChart comparison={comparison} />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : patientId ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma avaliação GMFM-88 registrada para este paciente.
        </p>
      ) : null}

      <Dialog open={formOpen} onOpenChange={handleFormOpenChange}>
        <DialogContent className="flex max-h-[92dvh] flex-col overflow-hidden sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing ? "Editar GMFM-88" : "Nova GMFM-88"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto pb-4">
              <Form {...form}>
                <form
                  id="gmfm-evaluation-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid gap-4"
                >
                  <GmfmEvaluationForm />
                </form>
              </Form>

              <div className="mt-4 rounded-md border border-border bg-muted/40 p-3 text-sm">
                Prévia: {liveSummary.totalScore}/{liveSummary.maxScore} (
                {liveSummary.percent.toFixed(1)}%)
              </div>
            </div>
            <ClinicalWorkspaceFooter>
              <ClinicalWorkspaceActions
                onCancel={() => handleFormOpenChange(false)}
                saveType="submit"
                saveForm="gmfm-evaluation-form"
                pending={pending}
              />
            </ClinicalWorkspaceFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
