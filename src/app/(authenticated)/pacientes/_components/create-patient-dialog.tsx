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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { EntityCombobox } from "@/components/entity-combobox";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import type { TeamMemberDTO } from "@/features/team/team.types";

function guardianOptionLabel(g: GuardianDTO) {
  return [
    g.name,
    g.cpf || null,
    g.hasPortalAccess ? "com acesso ao portal" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

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
  members,
  selectedMemberIds,
  onSelectedMemberIdsChange,
  canAssignMembers,
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
  members: TeamMemberDTO[];
  selectedMemberIds: string[];
  onSelectedMemberIdsChange: (ids: string[]) => void;
  canAssignMembers: boolean;
  pending: boolean;
  onSubmit: () => void;
}) {
  const activeMembers = members.filter((m) => m.status === "active");

  function toggleMember(id: string, checked: boolean) {
    onSelectedMemberIdsChange(
      checked
        ? [...selectedMemberIds, id]
        : selectedMemberIds.filter((x) => x !== id),
    );
  }

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

          <Separator />

          <FieldSet>
            <FieldLegend>Vínculo do responsável</FieldLegend>
            <FieldGroup>
              <Field>
                <FieldLabel>Como vincular o responsável?</FieldLabel>
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
                    <SelectItem value="new">
                      Cadastrar novo responsável
                    </SelectItem>
                    <SelectItem
                      value="existing"
                      disabled={guardians.length === 0}
                    >
                      Usar responsável já cadastrado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {guardianMode === "existing" ? (
                <Field>
                  <FieldLabel>Responsável</FieldLabel>
                  <EntityCombobox
                    options={guardians.map((g) => ({
                      id: g.id,
                      name: guardianOptionLabel(g),
                    }))}
                    value={selectedGuardianId}
                    onValueChange={onSelectedGuardianIdChange}
                    emptyText="Nenhum responsável encontrado"
                  />
                </Field>
              ) : null}
            </FieldGroup>
          </FieldSet>

          {guardianMode === "new" ? (
            <Form {...guardianForm}>
              <GuardianFormFields showPortalAccess />
            </Form>
          ) : null}

          {canAssignMembers && activeMembers.length > 0 ? (
            <>
              <Separator />
              <FieldSet>
                <FieldLegend>Profissionais que atendem</FieldLegend>
                <FieldGroup>
                  <ul className="flex max-h-48 flex-col gap-2 overflow-y-auto">
                    {activeMembers.map((m) => {
                      const checked = selectedMemberIds.includes(m.id);
                      return (
                        <li key={m.id}>
                          <Field
                            orientation="horizontal"
                            className="items-center gap-3"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) =>
                                toggleMember(m.id, v === true)
                              }
                              id={`create-member-${m.id}`}
                            />
                            <FieldLabel
                              htmlFor={`create-member-${m.id}`}
                              className="font-normal"
                            >
                              {m.name}
                            </FieldLabel>
                          </Field>
                        </li>
                      );
                    })}
                  </ul>
                </FieldGroup>
              </FieldSet>
            </>
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
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
