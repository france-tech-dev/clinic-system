"use client";

import { useMemo, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
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
import type { AssignableMemberOption } from "@/domains/patient/patient.types";
import { getHealthProfession } from "@/shared/constants/professions";
import { MemberStatus } from "@prisma/enums";

export function AssignPatientMembersDialog({
  open,
  onOpenChange,
  patientName,
  members,
  initialMemberIds,
  pending,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  members: AssignableMemberOption[];
  initialMemberIds: string[];
  pending: boolean;
  onSave: (memberIds: string[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState(initialMemberIds);
  const [query, setQuery] = useState("");

  const activeMembers = useMemo(
    () => members.filter((m) => m.status === MemberStatus.ACTIVE),
    [members],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeMembers;
    return activeMembers.filter((m) => m.name.toLowerCase().includes(q));
  }, [activeMembers, query]);

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
          setSelectedIds(initialMemberIds);
          setQuery("");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profissionais de {patientName}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Quem atende este paciente. O vínculo é bidireccional: o paciente
          também fica associado a estes profissionais.
        </p>

        {activeMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum profissional activo nesta clínica.
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
                aria-label="Buscar profissional por nome"
              />
            </InputGroup>

            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum profissional encontrado.
              </p>
            ) : (
              <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                {filtered.map((m) => {
                  const checked = selectedIds.includes(m.id);
                  const profession =
                    getHealthProfession(m.profession)?.label ?? m.profession;
                  return (
                    <li key={m.id}>
                      <Field
                        orientation="horizontal"
                        className="items-center gap-3"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => toggle(m.id, v === true)}
                          id={`assign-member-${m.id}`}
                        />
                        <FieldLabel
                          htmlFor={`assign-member-${m.id}`}
                          className="min-w-0 flex-1 font-normal"
                        >
                          <span className="truncate">{m.name}</span>
                          {profession ? (
                            <span className="text-muted-foreground">
                              {" "}
                              · {profession}
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
