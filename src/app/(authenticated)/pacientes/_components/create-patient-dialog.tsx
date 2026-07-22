"use client";

import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GuardianFormFields } from "@/features/guardian/components/guardian-form-fields";
import type { GuardianDraftInput } from "@/features/guardian/guardian.schema";
import type { GuardianDTO } from "@/features/guardian/guardian.types";
import { PATIENT_SEXES } from "@/features/patient/patient.schema";
import type {
  PatientPricingType,
  PatientSex,
} from "@/features/patient/patient.types";
import {
  PATIENT_PRICING_TYPES,
  patientPriceFieldLabel,
} from "@/shared/constants/patient-pricing";

const SEX_LABEL: Record<PatientSex, string> = {
  feminino: "Feminino",
  masculino: "Masculino",
  outro: "Outro",
  nao_informado: "Não informado",
};

export function CreatePatientDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  birthDate,
  onBirthDateChange,
  sex,
  onSexChange,
  notes,
  onNotesChange,
  pricingType,
  onPricingTypeChange,
  priceInput,
  onPriceInputChange,
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
  name: string;
  onNameChange: (value: string) => void;
  birthDate: string;
  onBirthDateChange: (value: string) => void;
  sex: PatientSex;
  onSexChange: (value: PatientSex) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  pricingType: PatientPricingType;
  onPricingTypeChange: (value: PatientPricingType) => void;
  priceInput: string;
  onPriceInputChange: (value: string) => void;
  guardianMode: "new" | "existing";
  onGuardianModeChange: (mode: "new" | "existing") => void;
  selectedGuardianId: string;
  onSelectedGuardianIdChange: (id: string) => void;
  guardians: GuardianDTO[];
  guardianForm: UseFormReturn<GuardianDraftInput>;
  pending: boolean;
  onSubmit: () => void;
}) {
  const guardianName =
    useWatch({
      control: guardianForm.control,
      name: "name",
    }) ?? "";
  const enablePortalAccess =
    useWatch({
      control: guardianForm.control,
      name: "enablePortalAccess",
    }) ?? false;
  const guardianEmail =
    useWatch({
      control: guardianForm.control,
      name: "email",
    }) ?? "";

  const canSubmit =
    name.trim().length > 0 &&
    (guardianMode === "existing"
      ? selectedGuardianId.length > 0
      : guardianName.trim().length > 0 &&
        (!enablePortalAccess || Boolean(guardianEmail.trim())));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Novo paciente</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <FieldSet>
            <FieldLegend>Paciente</FieldLegend>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="create-patient-name">Nome</FieldLabel>
                <Input
                  id="create-patient-name"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Data de nascimento</FieldLabel>
                  <DatePicker
                    longRange
                    value={birthDate}
                    onChange={onBirthDateChange}
                  />
                </Field>
                <Field>
                  <FieldLabel>Sexo</FieldLabel>
                  <Select
                    value={sex}
                    onValueChange={(v) => onSexChange(v as PatientSex)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PATIENT_SEXES.map((id) => (
                        <SelectItem key={id} value={id}>
                          {SEX_LABEL[id]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="create-patient-notes">
                  Observações
                </FieldLabel>
                <Textarea
                  id="create-patient-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Cobrança</FieldLabel>
                  <Select
                    value={pricingType}
                    onValueChange={(v) =>
                      onPricingTypeChange(v as PatientPricingType)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PATIENT_PRICING_TYPES.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>{patientPriceFieldLabel(pricingType)}</FieldLabel>
                  <Input
                    inputMode="decimal"
                    placeholder="0,00"
                    value={priceInput}
                    onChange={(e) => onPriceInputChange(e.target.value)}
                  />
                </Field>
              </div>
            </FieldGroup>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={pending || !canSubmit} onClick={onSubmit}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
