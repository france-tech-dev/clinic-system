"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  buildPatientReportPayload,
  getPatientReportContextAction,
  type PatientReportPayload,
} from "@/application/patient";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { Button } from "@/components/ui/button";
import { EntityCombobox } from "@/components/entity-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { AssessmentDTO } from "@/domains/assessment/assessment.types";
import type { PatientDTO } from "@/domains/patient/patient.types";
import { PatientPdfPreviewDialog } from "@/features/patient/components/patient-pdf-preview-dialog";
import { formatDateBR } from "@/shared/lib/date/format-date-br";
import { formatProfessionalSignature } from "@/shared/types/professional";

type ReportKind = "full" | "evaluation" | "anamnese";

export function RelatorioClient({ patients }: { patients: PatientDTO[] }) {
  const [patientId, setPatientId] = useState("");
  const [kind, setKind] = useState<ReportKind>("full");
  const [assessmentId, setAssessmentId] = useState("");
  const [assessments, setAssessments] = useState<AssessmentDTO[]>([]);
  const [previewPayload, setPreviewPayload] =
    useState<PatientReportPayload | null>(null);
  const [pending, startTransition] = useTransition();

  function onPatientChange(next: string) {
    setPatientId(next);
    setAssessmentId("");
    setAssessments([]);
    if (!next) return;
    startTransition(async () => {
      const result = await getPatientReportContextAction({ patientId: next });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setAssessments(result.data.assessments);
    });
  }

  function generate() {
    if (!patientId) {
      toast.error("Selecione um paciente");
      return;
    }
    startTransition(async () => {
      const result = await getPatientReportContextAction({ patientId });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      const ctx = result.data;
      setAssessments(ctx.assessments);

      if (kind === "evaluation") {
        const assessment =
          ctx.assessments.find((a) => a.id === assessmentId) ??
          ctx.assessments[0] ??
          null;
        if (!assessment) {
          toast.error("Este paciente ainda não tem ficha de avaliação");
          return;
        }
        setPreviewPayload(
          buildPatientReportPayload({
            detail: ctx.detail,
            assessments: ctx.assessments,
            evolutions: ctx.evolutions,
            mode: "evaluation",
            branding: ctx.branding,
            professional: ctx.professional,
            authorProfessional: assessment.authorProfessional ?? null,
            assessment,
          }),
        );
        return;
      }

      if (kind === "anamnese") {
        if (ctx.anamneseSections.length === 0) {
          toast.error("Este paciente ainda não tem anamnese");
          return;
        }
        setPreviewPayload({
          mode: "full",
          patientName: ctx.detail.patient.name,
          signature: formatProfessionalSignature(ctx.professional),
          branding: ctx.branding,
          assessments: [],
          selectedAssessment: null,
          anamneseSections: ctx.anamneseSections,
          evolutions: [],
          assessmentReportOptions: null,
        });
        return;
      }

      setPreviewPayload(
        buildPatientReportPayload({
          detail: ctx.detail,
          assessments: ctx.assessments,
          evolutions: ctx.evolutions,
          mode: "full",
          branding: ctx.branding,
          professional: ctx.professional,
          anamneseSections: ctx.anamneseSections,
        }),
      );
    });
  }

  return (
    <AppPage title="Relatórios">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Gere PDF de prontuário, ficha de avaliação ou anamnese a partir do
          paciente.
        </p>

        <div className="grid gap-1.5">
          <span className="text-sm font-medium">Paciente</span>
          <EntityCombobox
            options={patients.map((p) => ({ id: p.id, name: p.name }))}
            value={patientId}
            onValueChange={onPatientChange}
            placeholder="Selecione o paciente"
            emptyText="Nenhum paciente encontrado"
            allowClear
          />
        </div>

        <div className="grid gap-1.5">
          <span className="text-sm font-medium">Tipo de relatório</span>
          <Select
            value={kind}
            onValueChange={(v) => setKind(v as ReportKind)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Prontuário completo</SelectItem>
              <SelectItem value="evaluation">Ficha de avaliação</SelectItem>
              <SelectItem value="anamnese">Anamnese</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {kind === "evaluation" ? (
          <div className="grid gap-1.5">
            <span className="text-sm font-medium">Ficha</span>
            <Select
              value={assessmentId}
              onValueChange={setAssessmentId}
              disabled={!patientId || assessments.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    assessments.length === 0
                      ? "Nenhuma ficha neste paciente"
                      : "Selecione a ficha"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {assessments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.type} — {formatDateBR(a.date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <Button
          className="w-fit"
          disabled={!patientId || pending}
          onClick={generate}
        >
          {pending ? <Spinner data-icon="inline-start" /> : null}
          Gerar pré-visualização
        </Button>
      </div>

      <PatientPdfPreviewDialog
        payload={previewPayload}
        onClose={() => setPreviewPayload(null)}
      />
    </AppPage>
  );
}
