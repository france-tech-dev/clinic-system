"use client";

import { useMemo, useState, useTransition } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAnamneseAction,
  saveAnamneseAction,
} from "@/features/anamnese/anamnese.actions";
import type { AnamneseDTO } from "@/features/anamnese/anamnese.types";
import { AnamnesePdfPreviewDialog } from "@/features/anamnese/components/anamnese-pdf-preview-dialog";
import type { AnamneseReportPayload } from "@/features/anamnese/_lib/pdf/types";
import type { AssessmentPatientOption } from "@/shared/types/assessment-patient";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/shared/types/professional";
import { formatProfessionalSignature } from "@/shared/types/professional";
import type { AnamneseSection } from "../../../field-types";
import { AnamneseField } from "./anamnese-field";
import { flattenAnamneseForPdf } from "../../../flatten-for-pdf";

export function AnamneseFormClient({
  formId,
  formTitle,
  schema,
  patients,
  initialPatientId,
  initialAnamnese,
  branding,
  professional,
}: {
  formId: string;
  formTitle: string;
  schema: AnamneseSection[];
  patients: AssessmentPatientOption[];
  initialPatientId: string | null;
  initialAnamnese: AnamneseDTO | null;
  branding: PrintBranding;
  professional: ProfessionalProfile;
}) {
  const activePatients = useMemo(
    () => patients.filter((p) => p.status !== "alta"),
    [patients],
  );
  const [patientId, setPatientId] = useState(initialPatientId ?? "");
  const [data, setData] = useState<Record<string, unknown>>(
    initialAnamnese?.data ?? {},
  );
  const [pending, startTransition] = useTransition();
  const [previewPayload, setPreviewPayload] =
    useState<AnamneseReportPayload | null>(null);

  const patientName =
    activePatients.find((p) => p.id === patientId)?.name ?? "";

  function handlePatientChange(nextId: string | null) {
    const id = !nextId || nextId === "none" ? "" : nextId;
    setPatientId(id);
    if (!id) {
      setData({});
      return;
    }
    startTransition(async () => {
      const result = await getAnamneseAction({ patientId: id, formId });
      if (!result.success) {
        toast.error(result.error);
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
        toast.error(result.error);
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:max-w-md">
        <label className="text-sm font-medium">Paciente</label>
        <Select
          value={patientId || "none"}
          onValueChange={handlePatientChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o paciente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Selecione o paciente</SelectItem>
            {activePatients.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!patientId ? (
        <p className="text-sm text-muted-foreground">
          Escolha um paciente para preencher a anamnese.
        </p>
      ) : (
        <section className="space-y-6">
          {schema.map((sec) => (
            <div
              key={sec.id}
              className="rounded-md border border-border bg-card p-4"
            >
              <h3 className="mb-3 font-serif text-lg font-semibold">
                {sec.title}
              </h3>
              <div className="grid items-start gap-3 sm:grid-cols-2">
                {sec.fields.map((field) => (
                  <AnamneseField
                    key={field.id}
                    field={field}
                    data={data}
                    onChange={setData}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <FileText className="size-4" />
              Relatório PDF
            </Button>
            <Button disabled={pending} onClick={handleSave}>
              Salvar anamnese
            </Button>
          </div>
        </section>
      )}

      <AnamnesePdfPreviewDialog
        payload={previewPayload}
        onClose={() => setPreviewPayload(null)}
      />
    </div>
  );
}
