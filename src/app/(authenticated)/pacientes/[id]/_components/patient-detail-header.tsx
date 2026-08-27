"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown, FileText, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssignPatientMembersDialog } from "@/features/patient/components/assign-patient-members-dialog";
import { PatientProfessionalsIndicator } from "@/features/patient/components/patient-professionals-indicator";
import {
  PATIENT_STATUS_LABEL,
  PATIENT_STATUS_OPTIONS,
} from "@/shared/constants/patient-status";
import type {
  PatientDTO,
  PatientStatus,
} from "@/domains/patient/patient.types";
import type { TeamMemberDTO } from "@/domains/team/team.types";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { paths } from "@/shared/constants/paths";
import { cn } from "@/shared/lib/utils";
import { PatientStatus as PatientStatusEnum } from "@prisma/enums";

export function PatientDetailHeader({
  patient,
  orgMembers,
  isLeadership,
  pending,
  assignOpen,
  onAssignOpenChange,
  onEdit,
  onPreviewReport,
  onRemove,
  onRequestStatusChange,
  onSaveMembers,
}: {
  patient: PatientDTO;
  orgMembers: TeamMemberDTO[];
  isLeadership: boolean;
  pending: boolean;
  assignOpen: boolean;
  onAssignOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onPreviewReport: () => void;
  onRemove: () => void;
  onRequestStatusChange: (status: PatientStatus) => void;
  onSaveMembers: (memberIds: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <Link
            href={paths.pacientes}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Pacientes
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                patient.status === PatientStatusEnum.ACTIVE &&
                  "border-primary text-primary",
                patient.status === PatientStatusEnum.DISCHARGED &&
                  "border-muted-foreground",
                patient.status === PatientStatusEnum.PAUSED &&
                  "border-fichario-patient text-fichario-patient",
              )}
            >
              {PATIENT_STATUS_LABEL[patient.status]}
            </Badge>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">
                Profissionais
              </span>
              <PatientProfessionalsIndicator
                patientName={patient.name}
                professionals={patient.members}
                canEdit={isLeadership}
                disabled={pending}
                onEdit={() => onAssignOpenChange(true)}
              />
            </div>
          </div>

          <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {patient.birthDate ? (
              <div>
                <dt className="sr-only">Data de nascimento</dt>
                <dd>Nasc. {formatDateBR(patient.birthDate)}</dd>
              </div>
            ) : null}
            {patient.guardian?.name ? (
              <div>
                <dt className="sr-only">Responsável</dt>
                <dd>Resp. {patient.guardian.name}</dd>
              </div>
            ) : null}
          </dl>

          {patient.notes ? (
            <p className="text-sm text-muted-foreground">{patient.notes}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={onPreviewReport}>
            <FileText className="size-4" />
            Prontuário PDF
          </Button>
          {isLeadership ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  aria-label="Alterar status do paciente"
                >
                  Status
                  <ChevronDown data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {PATIENT_STATUS_OPTIONS.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    disabled={status === patient.status}
                    onClick={() => onRequestStatusChange(status)}
                  >
                    {PATIENT_STATUS_LABEL[status]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {isLeadership ? (
            <DeleteConfirmDialog onConfirm={onRemove} disabled={pending}>
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
                Remover
              </Button>
            </DeleteConfirmDialog>
          ) : null}
        </div>
      </div>

      {isLeadership && assignOpen ? (
        <AssignPatientMembersDialog
          open
          onOpenChange={onAssignOpenChange}
          patientName={patient.name}
          members={orgMembers}
          initialMemberIds={patient.members.map((m) => m.id)}
          pending={pending}
          onSave={onSaveMembers}
        />
      ) : null}
    </div>
  );
}
