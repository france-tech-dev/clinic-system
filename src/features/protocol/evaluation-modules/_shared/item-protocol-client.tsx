"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
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
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EntityCombobox } from "@/components/entity-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  compareProtocolEvaluationsAction,
  createProtocolEvaluationAction,
  deleteProtocolEvaluationAction,
  listProtocolEvaluationsAction,
  updateProtocolEvaluationAction,
} from "@/domains/protocol/protocol.actions";
import { protocolEvaluationFormSchema } from "@/domains/protocol/protocol.schema";
import type {
  ProtocolEvaluationComparisonDTO,
  ProtocolEvaluationDTO,
} from "@/domains/protocol/protocol.types";
import type { EvaluationModulePatientOption } from "@/shared/types/evaluation-module-patient";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";
import { cn } from "@/shared/lib/utils";
import {
  emptyItemProtocolResponses,
  listItemProtocolItemIds,
  type ItemProtocolTemplate,
} from "@/domains/protocol/evaluation-modules/_shared/item-protocol-template";
import {
  ITEM_SCALE_OPTIONS,
  type ItemResponseValue,
} from "@/domains/protocol/evaluation-modules/_shared/item-scale";
import { scoresToItemResponses } from "@/domains/protocol/evaluation-modules/_shared/parse-item-scores";
import { summarizeItemProtocol } from "@/domains/protocol/evaluation-modules/_shared/item-protocol-scoring";
import { ProtocolComparisonChart } from "@/features/protocol/evaluation-modules/_shared/protocol-comparison-chart";

type FormValues = {
  id?: string;
  patientId: string;
  protocolId: string;
  label: string;
  date: string;
  notes: string;
  scores: Record<string, ItemResponseValue | null>;
};

function shortLabel(value: ItemResponseValue): string {
  return String(value);
}

function buildDefaults(
  protocolId: string,
  template: ItemProtocolTemplate,
  patientId: string,
  editing: ProtocolEvaluationDTO | null,
  assessmentsLength: number,
): FormValues {
  if (editing) {
    return {
      id: editing.id,
      patientId,
      protocolId,
      label: editing.label,
      date: editing.date,
      notes: editing.notes,
      scores: scoresToItemResponses(template, editing.scores),
    };
  }
  return {
    patientId,
    protocolId,
    label: assessmentsLength === 0 ? "Avaliação" : "Reavaliação",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    scores: emptyItemProtocolResponses(template),
  };
}

export function ItemProtocolClient({
  protocolId,
  protocolName,
  template,
  patients,
  initialPatientId,
  initialProtocolEvaluations,
  canWrite,
}: {
  protocolId: string;
  protocolName: string;
  template: ItemProtocolTemplate;
  patients: EvaluationModulePatientOption[];
  initialPatientId: string | null;
  initialProtocolEvaluations: ProtocolEvaluationDTO[];
  canWrite: boolean;
}) {
  const activePatients = useMemo(
    () => patients.filter((p) => p.status !== "DISCHARGED"),
    [patients],
  );
  const [patientId, setPatientId] = useState(initialPatientId ?? "");
  const [assessments, setAssessments] = useState(initialProtocolEvaluations);
  const [editing, setEditing] = useState<ProtocolEvaluationDTO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [baselineId, setBaselineId] = useState("");
  const [followUpId, setFollowUpId] = useState("");
  const [comparison, setComparison] =
    useState<ProtocolEvaluationComparisonDTO | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      protocolEvaluationFormSchema,
    ) as Resolver<FormValues>,
    defaultValues: buildDefaults(
      protocolId,
      template,
      patientId,
      null,
      assessments.length,
    ),
  });

  const emptyScores = useMemo(
    () => emptyItemProtocolResponses(template),
    [template],
  );
  const scores =
    useWatch({ control: form.control, name: "scores" }) ?? emptyScores;
  const scaleOptions = ITEM_SCALE_OPTIONS[template.scale];
  const readOnly = !canWrite;

  const progress = useMemo(() => {
    const ids = listItemProtocolItemIds(template);
    const answered = ids.filter((id) => scores[id] != null).length;
    return { answered, total: ids.length };
  }, [scores, template]);

  const itemNumbers = useMemo(() => {
    const map = new Map<string, number>();
    let n = 0;
    for (const section of template.sections) {
      for (const item of section.items) {
        n += 1;
        map.set(item.id, n);
      }
    }
    return map;
  }, [template]);

  const progressValue =
    progress.total === 0 ? 0 : (progress.answered / progress.total) * 100;

  const liveSummary = useMemo(
    () => summarizeItemProtocol(template, scores),
    [scores, template],
  );

  function openCreate() {
    if (!patientId) {
      toast.error("Selecione um paciente");
      return;
    }
    setEditing(null);
    form.reset(
      buildDefaults(protocolId, template, patientId, null, assessments.length),
    );
    setDialogOpen(true);
  }

  function openEdit(row: ProtocolEvaluationDTO) {
    setEditing(row);
    form.reset(
      buildDefaults(protocolId, template, patientId, row, assessments.length),
    );
    setDialogOpen(true);
  }

  function reload(nextPatientId: string) {
    startTransition(async () => {
      const result = await listProtocolEvaluationsAction({
        patientId: nextPatientId,
        protocolId,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setAssessments(result.data);
    });
  }

  function onPatientChange(id: string) {
    setPatientId(id);
    setComparison(null);
    setBaselineId("");
    setFollowUpId("");
    reload(id);
  }

  function runComparison() {
    if (!baselineId || !followUpId) {
      toast.error("Selecione as duas avaliações para comparar");
      return;
    }
    if (baselineId === followUpId) {
      toast.error("Escolha avaliações diferentes");
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
      if (!result.data) {
        toast.error("Não foi possível gerar o comparativo");
        return;
      }
      setComparison(result.data);
    });
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const payload = {
        ...values,
        scores: values.scores as Record<string, number | string | null>,
      };
      const result = editing
        ? await updateProtocolEvaluationAction({ ...payload, id: editing.id })
        : await createProtocolEvaluationAction(payload);
      if (!result.success) {
        applyActionFieldErrors(form.setError, result.fieldErrors);
        toast.error(result.message);
        return;
      }
      toast.success(editing ? "Avaliação atualizada" : "Avaliação registrada");
      setDialogOpen(false);
      reload(patientId);
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const result = await deleteProtocolEvaluationAction({ id });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Avaliação removida");
      reload(patientId);
    });
  }

  function setAnswer(itemId: string, value: ItemResponseValue) {
    if (readOnly) return;
    form.setValue(`scores.${itemId}`, value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function sectionAnswered(sectionId: string): number {
    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return 0;
    return section.items.filter((item) => scores[item.id] != null).length;
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1.5 block text-sm font-medium">Paciente</label>
          <EntityCombobox
            options={activePatients.map((p) => ({
              id: p.id,
              name: p.name,
            }))}
            value={patientId}
            onValueChange={(v) => onPatientChange(v)}
            placeholder="Selecionar paciente"
          />
        </div>
        {canWrite ? (
          <Button
            type="button"
            onClick={openCreate}
            disabled={!patientId || pending}
          >
            <Plus data-icon="inline-start" />
            Nova avaliação
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{protocolName}</CardTitle>
          <CardDescription>
            Histórico de avaliações deste instrumento para o paciente.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {assessments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma avaliação registrada.
            </p>
          ) : (
            assessments.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateBR(row.date)}
                    {row.summary
                      ? ` · bruto ${row.summary.totalScore}/${row.summary.maxScore} (${row.summary.percent.toFixed(1)}%)`
                      : null}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(row)}
                  >
                    {canWrite ? "Editar" : "Ver"}
                  </Button>
                  {canWrite ? (
                    <DeleteConfirmDialog
                      onConfirm={() => onDelete(row.id)}
                      disabled={pending}
                    >
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </DeleteConfirmDialog>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {assessments.length >= 2 ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Comparativo</CardTitle>
            <CardDescription>
              Evolução do escore bruto (% do máximo por secção). Sem T-scores
              nem normas oficiais.
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[92dvh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="shrink-0 border-b border-border px-5 py-4 sm:px-6">
            <DialogTitle>
              {editing ? "Editar avaliação" : "Nova avaliação"} — {protocolName}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              id="item-protocol-form"
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
                <div className="grid items-start gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={readOnly}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Avaliação">Avaliação</SelectItem>
                            <SelectItem value="Reavaliação">
                              Reavaliação
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data *</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            disabled={readOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2 rounded-xl border border-border bg-muted/30 px-3 py-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium tabular-nums">
                      {progress.answered} / {progress.total} questões
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      Bruto {liveSummary.totalScore}/{liveSummary.maxScore} (
                      {liveSummary.percent.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-amber-500/10 px-3 py-2.5 text-sm text-amber-950 dark:bg-amber-400/10 dark:text-amber-100">
                  {scaleOptions.map((opt) => (
                    <span
                      key={String(opt.value)}
                      className="inline-flex items-center gap-1.5"
                    >
                      <span className="flex size-6 items-center justify-center rounded-full border border-amber-900/20 bg-card text-xs font-semibold dark:border-amber-100/20">
                        {shortLabel(opt.value)}
                      </span>
                      {opt.label}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  {template.sections.map((section) => {
                    const answered = sectionAnswered(section.id);
                    return (
                      <section
                        key={section.id}
                        className="overflow-hidden rounded-xl border border-border bg-card"
                      >
                        <div className="flex items-start justify-between gap-3 bg-muted/60 px-3 py-2.5 sm:px-4">
                          <h3 className="text-sm font-semibold tracking-tight uppercase">
                            {section.id.toUpperCase()}: {section.title}
                          </h3>
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            {answered} de {section.items.length}
                          </span>
                        </div>
                        <ul className="divide-y divide-border">
                          {section.items.map((item) => {
                            const value = scores[item.id];
                            const stringValue =
                              value === null || value === undefined
                                ? ""
                                : String(value);
                            return (
                              <li
                                key={item.id}
                                className="flex flex-col gap-2.5 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4"
                              >
                                <p className="min-w-0 flex-1 text-sm leading-snug">
                                  <span className="mr-1.5 font-medium text-muted-foreground tabular-nums">
                                    {itemNumbers.get(item.id)}.
                                  </span>
                                  {item.label}
                                </p>
                                <div
                                  className="flex shrink-0 flex-wrap gap-2"
                                  role="group"
                                  aria-label={item.label}
                                >
                                  {scaleOptions.map((opt) => {
                                    const selected =
                                      stringValue === String(opt.value);
                                    return (
                                      <button
                                        key={String(opt.value)}
                                        type="button"
                                        disabled={readOnly || pending}
                                        aria-pressed={selected}
                                        title={opt.label}
                                        onClick={() =>
                                          setAnswer(item.id, opt.value)
                                        }
                                        className={cn(
                                          "flex size-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                                          "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                                          selected
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                                          (readOnly || pending) &&
                                            "cursor-default opacity-80",
                                        )}
                                      >
                                        {shortLabel(opt.value)}
                                      </button>
                                    );
                                  })}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    );
                  })}
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} disabled={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-background px-4 py-3 sm:px-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={pending}
                >
                  Cancelar
                </Button>
                {canWrite ? (
                  <Button type="submit" disabled={pending}>
                    {pending ? <Spinner data-icon="inline-start" /> : null}
                    Salvar
                  </Button>
                ) : null}
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
