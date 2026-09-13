"use client";

import { useState } from "react";
import { IconChevronRight, IconId } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { PatientDTO } from "@/domains/patient/patient.types";
import { initialsFromName } from "@/shared/lib/initials-from-name";
import {
  PatientStatusBadge,
  PatientSummaryFields,
  PatientSummaryIdentity,
} from "./patient-summary-sidebar";

export function PatientMobileSummary({
  patient,
  clinicalEvaluationsCount,
  sessionNotesCount,
  canEditMembers,
  pending,
  onEditMembers,
  onPhotoChanged,
}: {
  patient: PatientDTO;
  clinicalEvaluationsCount: number;
  sessionNotesCount: number;
  canEditMembers: boolean;
  pending: boolean;
  onEditMembers: () => void;
  onPhotoChanged?: (patient: PatientDTO) => void;
}) {
  const [open, setOpen] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(0);

  const stripPhotoUrl = patient.photoUrl
    ? `${patient.photoUrl}${patient.photoUrl.includes("?") ? "&" : "?"}v=${photoVersion}`
    : null;

  function handlePhotoChanged(next: PatientDTO) {
    setPhotoVersion(Date.now());
    onPhotoChanged?.(next);
  }

  return (
    <>
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setOpen(true)}
      >
        <Avatar size="lg" className="size-11">
          {stripPhotoUrl ? (
            <AvatarImage src={stripPhotoUrl} alt={patient.name} />
          ) : null}
          <AvatarFallback className="text-xs">
            {initialsFromName(patient.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {patient.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <PatientStatusBadge status={patient.status} />
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <IconId className="size-3.5" />
              Ver ficha
            </span>
          </div>
        </div>

        <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] gap-0 overflow-hidden rounded-t-2xl p-0"
        >
          <SheetHeader className="border-b border-border px-4 pt-4 pb-3">
            <SheetTitle>Ficha do paciente</SheetTitle>
            <SheetDescription>
              Identificação, contacto e dados do prontuário.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-3.5">
              <PatientSummaryIdentity
                patient={patient}
                pending={pending}
                onPhotoChanged={handlePhotoChanged}
              />
              <PatientSummaryFields
                patient={patient}
                clinicalEvaluationsCount={clinicalEvaluationsCount}
                sessionNotesCount={sessionNotesCount}
                canEditMembers={canEditMembers}
                pending={pending}
                onEditMembers={() => {
                  setOpen(false);
                  onEditMembers();
                }}
              />
            </div>
          </div>

          <div className="border-t border-border p-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
