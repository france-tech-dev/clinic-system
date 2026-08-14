"use client";

import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntityCombobox } from "@/components/entity-combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { GuardianFormFields } from "@/features/guardian/components/guardian-form-fields";
import type { GuardianDraftInput } from "@/features/guardian/guardian.schema";
import type { GuardianDTO } from "@/features/guardian/guardian.types";
import { PatientFormFields } from "@/features/patient/components/patient-form-fields";
import type { PatientDraftInput } from "@/features/patient/patient.schema";

function guardianOptionLabel(g: GuardianDTO) {
  return [g.name, g.cpf || null].filter(Boolean).join(" · ");
}

export function EditPatientDialog({
  open,
  onOpenChange,
  patientForm,
  guardianId,
  onGuardianIdChange,
  guardians,
  guardianForm,
  guardianEmail,
  hasPortalAccess,
  pending,
  onSave,
  onEnablePortal,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientForm: UseFormReturn<PatientDraftInput>;
  guardianId: string;
  onGuardianIdChange: (id: string) => void;
  guardians: GuardianDTO[];
  guardianForm: UseFormReturn<GuardianDraftInput>;
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

        <form
          id="edit-patient-form"
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <Form {...patientForm}>
            <PatientFormFields />
          </Form>

          <Separator />

          {guardians.length > 1 ? (
            <Field>
              <FieldLabel>Responsável vinculado</FieldLabel>
              <EntityCombobox
                options={guardians.map((g) => ({
                  id: g.id,
                  name: guardianOptionLabel(g),
                }))}
                value={guardianId}
                onValueChange={onGuardianIdChange}
                emptyText="Nenhum responsável encontrado"
              />
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
                {pending ? <Spinner data-icon="inline-start" /> : null}
                Criar acesso ao portal
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Portal do responsável já ativo.
            </p>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" form="edit-patient-form" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
