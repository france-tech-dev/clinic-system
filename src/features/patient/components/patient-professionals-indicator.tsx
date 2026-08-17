"use client";

import { Users } from "lucide-react";
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
import type { PatientMemberEmbed } from "@/features/patient/patient.types";
import { initialsFromName } from "@/shared/lib/initials-from-name";
import { cn } from "@/shared/lib/utils";

const MAX_VISIBLE = 3;

function ProfessionalAvatar({
  professional,
  size = "sm",
}: {
  professional: PatientMemberEmbed;
  size?: "default" | "sm";
}) {
  return (
    <Avatar size={size}>
      {professional.imageUrl ? (
        <AvatarImage src={professional.imageUrl} alt={professional.name} />
      ) : null}
      <AvatarFallback>{initialsFromName(professional.name)}</AvatarFallback>
    </Avatar>
  );
}

export function PatientProfessionalsIndicator({
  patientName,
  professionals,
  canEdit,
  disabled,
  onEdit,
}: {
  patientName: string;
  professionals: PatientMemberEmbed[];
  canEdit: boolean;
  disabled?: boolean;
  onEdit?: () => void;
}) {
  const hasProfessionals = professionals.length > 0;
  const visible = professionals.slice(0, MAX_VISIBLE);
  const overflow = professionals.length - visible.length;
  const countLabel = hasProfessionals
    ? `${professionals.length} profissional${professionals.length === 1 ? "" : "is"}`
    : "Sem profissionais";

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
            hasProfessionals && "text-foreground/70",
            canEdit && "hover:text-foreground",
          )}
          aria-label={
            canEdit
              ? `Profissionais de ${patientName} — ${countLabel}. Clique para editar.`
              : `Profissionais de ${patientName} — ${countLabel}`
          }
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (canEdit && !disabled) onEdit?.();
          }}
        >
          {hasProfessionals ? (
            <AvatarGroup className="-space-x-1.5">
              {visible.map((professional) => (
                <ProfessionalAvatar
                  key={professional.id}
                  professional={professional}
                />
              ))}
              {overflow > 0 ? (
                <AvatarGroupCount className="size-6 text-[10px]">
                  +{overflow}
                </AvatarGroupCount>
              ) : null}
            </AvatarGroup>
          ) : (
            <Users className="size-4" />
          )}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-64 p-0">
        <div className="border-b border-border px-3 py-2">
          <p className="text-sm font-medium text-primary">Profissionais</p>
        </div>
        {hasProfessionals ? (
          <ul className="max-h-56 overflow-y-auto py-1">
            {professionals.map((professional) => (
              <li
                key={professional.id}
                className="flex items-center gap-2 border-b border-border/60 px-3 py-2 text-sm last:border-b-0"
              >
                <ProfessionalAvatar professional={professional} />
                <span className="min-w-0 truncate">{professional.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 py-3 text-sm text-muted-foreground">
            Nenhum profissional vinculado.
            {canEdit ? " Clique para atribuir." : null}
          </p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
