"use client";

import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GuardianFormFields } from "@/features/guardian/components/guardian-form-fields";
import type { GuardianDraftInput } from "@/features/guardian/guardian.schema";
import type { GuardianDTO } from "@/features/guardian/guardian.types";
import { PatientFormFields } from "@/features/patient/components/patient-form-fields";
import type { PatientDraftInput } from "@/features/patient/patient.schema";

export function CreatePatientDialog({
  open,
  onOpenChange,
  patientForm,
  guardianMode,
  onGuardianModeChange,
  selectedGuardianId,
  onSelectedGuardianIdChange,
  guardians,
  guardianForm,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientForm: UseFormReturn<PatientDraftInput>;
  guardianMode: "new" | "existing";
  onGuardianModeChange: (mode: "new" | "existing") => void;
  selectedGuardianId: string;
  onSelectedGuardianIdChange: (id: string) => void;
  guardians: GuardianDTO[];
  guardianForm: UseFormReturn<GuardianDraftInput>;
  pending: boolean;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo paciente</DialogTitle>
        </DialogHeader>

        <form
          id="create-patient-form"
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <FieldSet>
            <FieldLegend>Paciente</FieldLegend>
            <Form {...patientForm}>
              <PatientFormFields />
            </Form>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Vínculo do responsável</FieldLegend>
            <FieldGroup>
              <Field>
                <FieldLabel>Modo</FieldLabel>
                <Select
                  value={guardianMode}
                  onValueChange={(v) =>
                    onGuardianModeChange(v as "new" | "existing")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo responsável</SelectItem>
                    <SelectItem
                      value="existing"
                      disabled={guardians.length === 0}
                    >
                      Responsável existente
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {guardianMode === "existing" ? (
                <Field>
                  <FieldLabel>Responsável</FieldLabel>
                  <Select
                    value={selectedGuardianId || undefined}
                    onValueChange={(v) => onSelectedGuardianIdChange(v ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {guardians.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                          {g.cpf ? ` · ${g.cpf}` : ""}
                          {g.hasPortalAccess ? " · portal" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ) : null}
            </FieldGroup>
          </FieldSet>

          {guardianMode === "new" ? (
            <Form {...guardianForm}>
              <GuardianFormFields showPortalAccess />
            </Form>
          ) : null}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" form="create-patient-form" disabled={pending}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
