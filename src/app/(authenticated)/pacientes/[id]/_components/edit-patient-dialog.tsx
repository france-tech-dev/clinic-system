"use client";

import type { UseFormReturn } from "react-hook-form";
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
import { Separator } from "@/components/ui/separator";
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

export function EditPatientDialog({
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
  guardianId,
  onGuardianIdChange,
  guardians,
  guardianForm,
  guardianName,
  guardianEmail,
  hasPortalAccess,
  pending,
  onSave,
  onEnablePortal,
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
  guardianId: string;
  onGuardianIdChange: (id: string) => void;
  guardians: GuardianDTO[];
  guardianForm: UseFormReturn<GuardianDraftInput>;
  guardianName: string;
  guardianEmail: string;
  hasPortalAccess: boolean;
  pending: boolean;
  onSave: () => void;
  onEnablePortal: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar paciente</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <FieldSet>
            <FieldLegend>Paciente</FieldLegend>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-patient-name">Nome</FieldLabel>
                <Input
                  id="edit-patient-name"
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
                <FieldLabel htmlFor="edit-patient-notes">
                  Observações
                </FieldLabel>
                <Textarea
                  id="edit-patient-notes"
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

          <Separator />

          {guardians.length > 1 ? (
            <Field>
              <FieldLabel>Responsável vinculado</FieldLabel>
              <Select
                value={guardianId}
                onValueChange={(v) => {
                  if (!v) return;
                  onGuardianIdChange(v);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {guardians.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                      {g.cpf ? ` · ${g.cpf}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}

          <Form {...guardianForm}>
            <GuardianFormFields />
          </Form>

          {!hasPortalAccess ? (
            <div className="rounded-md border border-border p-3">
              <p className="text-sm text-muted-foreground">
                Este responsável ainda não tem acesso ao portal. É necessário
                e-mail cadastrado.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                disabled={pending || !guardianEmail.trim()}
                onClick={onEnablePortal}
              >
                Criar acesso ao portal
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Portal do responsável já ativo.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={pending || !name.trim() || !guardianName.trim()}
            onClick={onSave}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
