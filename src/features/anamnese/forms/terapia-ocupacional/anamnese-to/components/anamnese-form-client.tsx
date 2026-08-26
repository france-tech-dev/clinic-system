"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import {
  ClinicalWorkspaceActions,
  ClinicalWorkspaceShell,
} from "@/components/clinical-workspace-shell";
import { EntityCombobox } from "@/components/entity-combobox";
import { Button } from "@/components/ui/button";
import {
  getAnamneseAction,
  saveAnamneseAction,
} from "@/domains/anamnese/anamnese.actions";
import type { AnamneseDTO } from "@/domains/anamnese/anamnese.types";
import type { AnamneseReportPayload } from "@/domains/anamnese/_lib/pdf/types";
import { AnamnesePdfPreviewDialog } from "@/features/anamnese/components/anamnese-pdf-preview-dialog";
import { paths } from "@/shared/constants/paths";
import type { EvaluationModulePatientOption } from "@/shared/types/evaluation-module-patient";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/shared/types/professional";
import { formatProfessionalSignature } from "@/shared/types/professional";
import { PatientStatus } from "@prisma/enums";
import type { AnamneseSection } from "@/domains/anamnese/forms/field-types";
import { AnamneseField } from "./anamnese-field";
import { flattenAnamneseForPdf } from "@/domains/anamnese/forms/flatten-for-pdf";

export function AnamneseFormClient({
  formId,
  formTitle,
  schema,
  patients,
  initialPatientId,
  initialAnamnese,
  branding,
  professional,
  canWrite,
}: {
  formId: string;
  formTitle: string;
  schema: AnamneseSection[];
  patients: EvaluationModulePatientOption[];
  initialPatientId: string | null;
  initialAnamnese: AnamneseDTO | null;
  branding: PrintBranding;
  professional: ProfessionalProfile;
  canWrite: boolean;
}) {
  const router = useRouter();
  const activePatients = useMemo(
    () => patients.filter((p) => p.status !== PatientStatus.DISCHARGED),
    [patients],
  );
  const [patientId, setPatientId] = useState(initialPatientId ?? "");
  const [data, setData] = useState<Record<string, unknown>>(
    initialAnamnese?.data ?? {},
  );
  const [activeSectionId, setActiveSectionId] = useState(
    () => schema[0]?.id ?? "",
  );
  const [pending, startTransition] = useTransition();
  const [previewPayload, setPreviewPayload] =
    useState<AnamneseReportPayload | null>(null);

  const patientName =
    activePatients.find((p) => p.id === patientId)?.name ?? "";
  const activeSection =
    schema.find((sec) => sec.id === activeSectionId) ?? schema[0];

  function handlePatientChange(nextId: string) {
    const id = nextId || "";
    setPatientId(id);
    if (!id) {
      setData({});
      return;
    }
    startTransition(async () => {
      const result = await getAnamneseAction({ patientId: id, formId });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setData(result.data?.data ?? {});
    });
  }

  function handleSave() {
    if (!patientId) {
      toast.error("Selecione um paciente");
      return;
    }
    startTransition(async () => {
      const result = await saveAnamneseAction({
        patientId,
        formId,
        data,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Anamnese salva");
    });
  }

  function handlePreview() {
    if (!patientId || !patientName) {
      toast.error("Selecione um paciente");
      return;
    }
    setPreviewPayload({
      documentTitle: formTitle,
      patientName,
      signature: formatProfessionalSignature(professional),
      branding,
      sections: flattenAnamneseForPdf(schema, data),
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-col gap-2 sm:max-w-md">
        <label className="text-sm font-medium">Paciente</label>
        <EntityCombobox
          options={activePatients}
          value={patientId}
          onValueChange={handlePatientChange}
          placeholder="Selecione o paciente"
          emptyText="Nenhum paciente encontrado"
        />
      </div>

      {!patientId ? (
        <p className="text-sm text-muted-foreground">
          {canWrite
            ? "Escolha um paciente para preencher a anamnese."
            : "Escolha um paciente para consultar a anamnese."}
        </p>
      ) : activeSection ? (
        <ClinicalWorkspaceShell
          navLabel="Secções da anamnese"
          items={schema.map((sec) => ({
            id: sec.id,
            label: sec.title,
          }))}
          activeId={activeSection.id}
          onSelect={setActiveSectionId}
          footer={
            <ClinicalWorkspaceActions
              onCancel={() => router.push(paths.anamnese.root)}
              onSave={handleSave}
              saveLabel="Salvar anamnese"
              pending={pending}
              showSave={canWrite}
              extra={
                <Button variant="outline" onClick={handlePreview}>
                  <FileText className="size-4" />
                  Relatório PDF
                </Button>
              }
            />
          }
        >
          <div>
            <h3 className="font-serif text-lg font-semibold">
              {activeSection.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Secção {schema.findIndex((s) => s.id === activeSection.id) + 1} de{" "}
              {schema.length}
            </p>
          </div>
          <div className="grid items-start gap-3 sm:grid-cols-2">
            {activeSection.fields.map((field) => (
              <AnamneseField
                key={field.id}
                field={field}
                data={data}
                onChange={setData}
                disabled={!canWrite}
              />
            ))}
          </div>
        </ClinicalWorkspaceShell>
      ) : null}

      <AnamnesePdfPreviewDialog
        payload={previewPayload}
        onClose={() => setPreviewPayload(null)}
      />
    </div>
  );
}
