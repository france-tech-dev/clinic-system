"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GmfmAssessmentForm } from "@/features/protocol/components/gmfm-assessment-form";
import { GmfmComparisonChart } from "@/features/protocol/components/gmfm-comparison-chart";
import { GMFM88_PROTOCOL_ID } from "@/features/protocol/_lib/gmfm-88-template";
import {
  emptyGmfm88Scores,
  summarizeGmfm88,
  type Gmfm88Scores,
} from "@/features/protocol/_lib/gmfm-88-scoring";
import {
  compareProtocolAssessmentsAction,
  createProtocolAssessmentAction,
  deleteProtocolAssessmentAction,
  listProtocolAssessmentsAction,
  updateProtocolAssessmentAction,
} from "@/features/protocol/protocol.actions";
import type {
  ProtocolAssessmentDTO,
  ProtocolComparisonDTO,
} from "@/features/protocol/protocol.types";
import type { PatientDTO } from "@/features/patient/patient.types";
import { formatDateBR } from "@/shared/lib/format-date-br";

export function GmfmProtocolClient({
  patients,
  initialPatientId,
  initialAssessments,
}: {
  patients: PatientDTO[];
  initialPatientId: string | null;
  initialAssessments: ProtocolAssessmentDTO[];
}) {
  const [patientId, setPatientId] = useState(initialPatientId ?? "");
  const [assessments, setAssessments] =
    useState<ProtocolAssessmentDTO[]>(initialAssessments);
  const [baselineId, setBaselineId] = useState("");
  const [followUpId, setFollowUpId] = useState("");
  const [comparison, setComparison] = useState<ProtocolComparisonDTO | null>(
    null,
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProtocolAssessmentDTO | null>(null);
  const [label, setLabel] = useState("Avaliação");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [scores, setScores] = useState<Gmfm88Scores>(emptyGmfm88Scores());
  const [pending, startTransition] = useTransition();

  const activePatients = useMemo(
    () => patients.filter((p) => p.status !== "alta"),
    [patients],
  );

  const liveSummary = useMemo(() => summarizeGmfm88(scores), [scores]);

  function loadAssessments(id: string) {
    if (!id) {
      setAssessments([]);
      setBaselineId("");
      setFollowUpId("");
      setComparison(null);
      return;
    }

    startTransition(async () => {
      const result = await listProtocolAssessmentsAction({
        patientId: id,
        protocolId: GMFM88_PROTOCOL_ID,
      });
      if (!result.success) {
        toast.error(result.error);
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
    setLabel(assessments.length === 0 ? "Avaliação" : "Reavaliação");
    setDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setScores(emptyGmfm88Scores());
    setFormOpen(true);
  }

  function openEdit(item: ProtocolAssessmentDTO) {
    setEditing(item);
    setLabel(item.label);
    setDate(item.date);
    setNotes(item.notes);
    setScores({ ...emptyGmfm88Scores(), ...item.scores });
    setFormOpen(true);
  }

  function saveAssessment() {
    if (!patientId) {
      toast.error("Selecione um paciente");
      return;
    }

    startTransition(async () => {
      const payload = {
        patientId,
        protocolId: GMFM88_PROTOCOL_ID as "gmfm-88",
        label,
        date,
        notes,
        scores,
      };

      const result = editing
        ? await updateProtocolAssessmentAction({ id: editing.id, ...payload })
        : await createProtocolAssessmentAction(payload);

      if (!result.success) {
        toast.error(result.error);
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
      const result = await deleteProtocolAssessmentAction({ id });
      if (!result.success) {
        toast.error(result.error);
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
      const result = await compareProtocolAssessmentsAction({
        baselineId,
        followUpId,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setComparison(result.data);
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Protocolo GMFM-88 — Gross Motor Function Measure. Registe avaliações
        estruturadas (0–3 por item), acompanhe percentuais por domínio e
        compare avaliação vs. reavaliação.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Paciente</CardTitle>
          <CardDescription>
            Baseado no modelo{" "}
            <span className="font-medium">GMFM88 - DANIEL.xlsx</span> (5
            domínios, 88 itens).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Select
            value={patientId || "none"}
            onValueChange={(v) => {
              const id = v === "none" ? "" : v;
              setPatientId(id);
              loadAssessments(id);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o paciente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Selecione…</SelectItem>
              {activePatients.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {patientId ? (
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(a)}
                      disabled={pending}
                    >
                      Editar
                    </Button>
                    <DeleteConfirmDialog
                      title="Excluir avaliação GMFM-88?"
                      description="Esta avaliação será removida permanentemente."
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
                <div className="grid gap-3 sm:grid-cols-2">
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
                    <GmfmComparisonChart comparison={comparison} />
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing ? "Editar GMFM-88" : "Nova GMFM-88"}
            </DialogTitle>
          </DialogHeader>

          <GmfmAssessmentForm
            label={label}
            onLabelChange={setLabel}
            date={date}
            onDateChange={setDate}
            notes={notes}
            onNotesChange={setNotes}
            scores={scores}
            onScoresChange={setScores}
          />

          <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
            Prévia: {liveSummary.totalScore}/{liveSummary.maxScore} (
            {liveSummary.percent.toFixed(1)}%)
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={pending} onClick={saveAssessment}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
