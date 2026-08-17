"use client";

import { Baby } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { TeamMemberPatientEmbed } from "@/features/team/team.types";
import { initialsFromName } from "@/shared/lib/initials-from-name";
import { cn } from "@/shared/lib/utils";

const MAX_VISIBLE = 3;

function PatientAvatar({ patient }: { patient: TeamMemberPatientEmbed }) {
  return (
    <Avatar size="sm">
      {patient.photoUrl ? (
        <AvatarImage src={patient.photoUrl} alt={patient.name} />
      ) : null}
      <AvatarFallback>{initialsFromName(patient.name)}</AvatarFallback>
    </Avatar>
  );
}

export function MemberPatientsIndicator({
  memberName,
  patients,
  canEdit,
  disabled,
  onEdit,
}: {
  memberName: string;
  patients: TeamMemberPatientEmbed[];
  canEdit: boolean;
  disabled?: boolean;
  onEdit?: () => void;
}) {
  const hasPatients = patients.length > 0;
  const visible = patients.slice(0, MAX_VISIBLE);
  const overflow = patients.length - visible.length;
  const countLabel = hasPatients
    ? `${patients.length} paciente${patients.length === 1 ? "" : "s"}`
    : "Sem pacientes";

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-8 px-1.5 text-muted-foreground",
            hasPatients && "text-foreground/70",
            canEdit && "hover:text-foreground",
          )}
          aria-label={
            canEdit
              ? `Pacientes de ${memberName} — ${countLabel}. Clique para editar.`
              : `Pacientes de ${memberName} — ${countLabel}`
          }
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (canEdit && !disabled) onEdit?.();
          }}
        >
          {hasPatients ? (
            <AvatarGroup className="-space-x-1.5">
              {visible.map((patient) => (
                <PatientAvatar key={patient.id} patient={patient} />
              ))}
              {overflow > 0 ? (
                <AvatarGroupCount className="size-6 text-[10px]">
                  +{overflow}
                </AvatarGroupCount>
              ) : null}
            </AvatarGroup>
          ) : (
            <Baby className="size-4" />
          )}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-64 p-0">
        <div className="border-b border-border px-3 py-2">
          <p className="text-sm font-medium text-primary">Pacientes</p>
        </div>
        {hasPatients ? (
          <ul className="max-h-56 overflow-y-auto py-1">
            {patients.map((patient) => (
              <li
                key={patient.id}
                className="flex items-center gap-2 border-b border-border/60 px-3 py-2 text-sm last:border-b-0"
              >
                <PatientAvatar patient={patient} />
                <span className="min-w-0 truncate">{patient.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 py-3 text-sm text-muted-foreground">
            Nenhum paciente vinculado a este profissional.
            {canEdit ? " Clique para atribuir." : null}
          </p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
