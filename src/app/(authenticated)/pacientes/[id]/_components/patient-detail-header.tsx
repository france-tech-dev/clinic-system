"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown, FileText, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PATIENT_STATUS_LABEL,
  PATIENT_STATUS_OPTIONS,
} from "@/shared/constants/patient-status";
import type {
  PatientDTO,
  PatientStatus,
} from "@/domains/patient/patient.types";
import { paths } from "@/shared/constants/paths";

export function PatientDetailHeader({
  patient,
  isLeadership,
  pending,
  onEdit,
  onPreviewReport,
  onRemove,
  onRequestStatusChange,
}: {
  patient: PatientDTO;
  isLeadership: boolean;
  pending: boolean;
  onEdit: () => void;
  onPreviewReport: () => void;
  onRemove: () => void;
  onRequestStatusChange: (status: PatientStatus) => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <Link
          href={paths.pacientes}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Pacientes
        </Link>
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
  );
}
