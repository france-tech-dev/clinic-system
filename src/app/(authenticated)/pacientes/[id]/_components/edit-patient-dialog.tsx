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
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { GuardianFormFields } from "@/features/guardian/components/guardian-form-fields";
import type { GuardianDraftInput } from "@/features/guardian/guardian.schema";
import type { GuardianDTO } from "@/features/guardian/guardian.types";
import { PatientFormFields } from "@/features/patient/components/patient-form-fields";
import type { PatientDraftInput } from "@/features/patient/patient.schema";

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
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
