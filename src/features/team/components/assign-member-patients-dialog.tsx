"use client";

import { useMemo, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { initialsFromName } from "@/shared/lib/initials-from-name";
import type { AssignablePatientOption } from "@/domains/team/team.types";

export function AssignMemberPatientsDialog({
  open,
  onOpenChange,
  memberName,
  patients,
  initialPatientIds,
  pending,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  patients: AssignablePatientOption[];
  initialPatientIds: string[];
  pending: boolean;
  onSave: (patientIds: string[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState(initialPatientIds);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.name.toLowerCase().includes(q));
  }, [patients, query]);

  function toggle(id: string, checked: boolean) {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setSelectedIds(initialPatientIds);
          setQuery("");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pacientes de {memberName}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Quem este profissional atende. O vínculo é bidireccional: o paciente
          também fica associado a este profissional.
        </p>

        {patients.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ainda não há pacientes nesta clínica.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <InputGroup>
              <InputGroupAddon>
                <IconSearch data-icon="inline-start" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Buscar por nome…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar paciente por nome"
              />
            </InputGroup>

            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum paciente encontrado.
              </p>
            ) : (
              <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                {filtered.map((patient) => {
                  const checked = selectedIds.includes(patient.id);
                  return (
                    <li key={patient.id}>
                      <Field
                        orientation="horizontal"
                        className="items-center gap-3"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) =>
                            toggle(patient.id, v === true)
                          }
                          id={`assign-patient-${patient.id}`}
                        />
                        <FieldLabel
                          htmlFor={`assign-patient-${patient.id}`}
                          className="min-w-0 flex-1 items-center font-normal"
                        >
                          <Avatar size="sm">
                            {patient.photoUrl ? (
                              <AvatarImage
                                src={patient.photoUrl}
                                alt={patient.name}
                              />
                            ) : null}
                            <AvatarFallback>
                              {initialsFromName(patient.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{patient.name}</span>
                          {patient.statusLabel ? (
                            <span className="text-muted-foreground">
                              {" "}
                              · {patient.statusLabel}
                            </span>
                          ) : null}
                        </FieldLabel>
                      </Field>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={() => onSave(selectedIds)}
          >
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
