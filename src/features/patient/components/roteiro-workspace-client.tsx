"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoteiroSection } from "@/features/patient/components/roteiro-section";
import { useRoteiroNotes } from "@/features/patient/hooks/use-roteiro-notes";
import { listRoteiroNotesAction } from "@/features/patient/patient.actions";
import type { RoteiroNoteDTO } from "@/features/patient/patient.types";
import type { RoteiroId } from "@/shared/constants/roteiros";
import type { AssessmentPatientOption } from "@/shared/types/assessment-patient";

export function RoteiroWorkspaceClient({
  roteiroId,
  patients,
  initialPatientId,
  initialNotes,
}: {
  roteiroId: RoteiroId;
  patients: AssessmentPatientOption[];
  initialPatientId: string | null;
  initialNotes: RoteiroNoteDTO[];
}) {
  const [patientId, setPatientId] = useState(initialPatientId ?? "");
  const [pending, startTransition] = useTransition();

  const roteiro = useRoteiroNotes({
    patientId,
    initialNotes,
    initialRoteiroId: roteiroId,
    pending,
    startTransition,
  });

  const activePatients = patients.filter((p) => p.status !== "alta");

  function handlePatientChange(value: string) {
    const id = value === "none" ? "" : (value ?? "");
    setPatientId(id);
    if (!id) {
      roteiro.replaceNotes([], roteiroId);
      return;
    }
    startTransition(async () => {
      const result = await listRoteiroNotesAction(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      roteiro.replaceNotes(result.data, roteiroId);
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {roteiro.currentRoteiro.label} — roteiro clínico de Terapia Ocupacional.
        Selecione o paciente e registre notas de caso por categoria.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={patientId || "none"}
            onValueChange={handlePatientChange}
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
        </CardContent>
      </Card>

      {patientId ? (
        <RoteiroSection
          currentRoteiro={roteiro.currentRoteiro}
          currentCategory={roteiro.currentCategory}
          roteiroDraft={roteiro.roteiroDraft}
          onRoteiroDraftChange={roteiro.setRoteiroDraft}
          currentRoteiroNote={roteiro.currentRoteiroNote}
          pending={roteiro.pending}
          onSelectTick={roteiro.selectTick}
          onSave={roteiro.saveCurrentRoteiroNote}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Selecione um paciente para registrar as notas do roteiro.
        </p>
      )}
    </div>
  );
}
