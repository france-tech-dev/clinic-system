"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PatientPhotoControl } from "@/features/patient/components/patient-photo-control";
import { PatientProfessionalsIndicator } from "@/features/patient/components/patient-professionals-indicator";
import type { PatientDTO } from "@/domains/patient/patient.types";
import { PATIENT_STATUS_LABEL } from "@/shared/constants/patient-status";
import { patientPricingTypeLabel } from "@/shared/constants/patient-pricing";
import { PATIENT_SEX_LABEL } from "@/shared/constants/patient-sex";
import { formatDateBR } from "@/shared/lib/date/format-date-br";
import { formatBrl } from "@/shared/lib/money-utils";
import { cn } from "@/shared/lib/utils";
import { PatientStatus } from "@prisma/enums";

function labelValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Não informado";
}

function ageFromBirthDate(birthDate: string | null): string | null {
  if (!birthDate) return null;
  const [year, month, day] = birthDate.split("-").map(Number);
  if (!year || !month || !day) return null;

  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age -= 1;
  }
  if (age < 0) return null;
  return `${age} ano${age === 1 ? "" : "s"}`;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{children}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {children}
    </section>
  );
}

export function PatientStatusBadge({
  status,
  className,
}: {
  status: PatientDTO["status"];
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === PatientStatus.ACTIVE && "border-primary text-primary",
        status === PatientStatus.DISCHARGED && "border-muted-foreground",
        status === PatientStatus.PAUSED &&
          "border-fichario-patient text-fichario-patient",
        className,
      )}
    >
      {PATIENT_STATUS_LABEL[status]}
    </Badge>
  );
}

export function PatientSummaryFields({
  patient,
  clinicalEvaluationsCount,
  sessionNotesCount,
  canEditMembers,
  pending,
  onEditMembers,
}: {
  patient: PatientDTO;
  clinicalEvaluationsCount: number;
  sessionNotesCount: number;
  canEditMembers: boolean;
  pending: boolean;
  onEditMembers: () => void;
}) {
  const age = ageFromBirthDate(patient.birthDate);
  const notes = patient.notes.trim();

  return (
    <div className="flex flex-col gap-3.5">
      <Section title="Identificação">
        <div className="flex flex-col gap-2">
          <Field label="Nascimento">
            {patient.birthDate
              ? `${formatDateBR(patient.birthDate)}${age ? ` · ${age}` : ""}`
              : "Não informado"}
          </Field>
          <Field label="Sexo">{PATIENT_SEX_LABEL[patient.sex]}</Field>
        </div>
      </Section>

      <Separator />

      <Section title="Equipe">
        <div className="-ml-1.5">
          <PatientProfessionalsIndicator
            patientName={patient.name}
            professionals={patient.members}
            canEdit={canEditMembers}
            disabled={pending}
            onEdit={onEditMembers}
          />
        </div>
        {patient.members.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhum profissional vinculado.
          </p>
        ) : null}
      </Section>

      <Separator />

      <Section title="Contato">
        <div className="flex flex-col gap-2">
          <Field label="Responsável">
            {labelValue(patient.guardian?.name)}
          </Field>
          <Field label="Telefone">{labelValue(patient.guardian?.phone)}</Field>
        </div>
      </Section>

      <Separator />

      <Section title="Prontuário">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Avaliações">{clinicalEvaluationsCount}</Field>
          <Field label="Evoluções">{sessionNotesCount}</Field>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-muted-foreground">Observações</p>
          {notes ? (
            <p className="text-sm leading-relaxed text-foreground">{notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sem observações no prontuário.
            </p>
          )}
        </div>
      </Section>

      <Separator />

      <Section title="Financeiro">
        <Field label={patientPricingTypeLabel(patient.pricingType)}>
          {patient.price != null ? formatBrl(patient.price) : "Não definido"}
        </Field>
      </Section>
    </div>
  );
}

export function PatientSummaryIdentity({
  patient,
  pending,
  onPhotoChanged,
}: {
  patient: PatientDTO;
  pending: boolean;
  onPhotoChanged?: (patient: PatientDTO) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <PatientPhotoControl
        key={patient.id}
        patientId={patient.id}
        name={patient.name}
        photoUrl={patient.photoUrl}
        disabled={pending}
        onChanged={onPhotoChanged}
      />
      <div className="min-w-0 w-full">
        <p className="truncate text-base font-medium text-foreground">
          {patient.name}
        </p>
        <div className="mt-1.5 flex justify-center">
          <PatientStatusBadge status={patient.status} />
        </div>
      </div>
    </div>
  );
}

export function PatientSummarySidebar({
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
  return (
    <aside className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-3.5 xl:sticky xl:top-0 xl:self-start">
      <PatientSummaryIdentity
        patient={patient}
        pending={pending}
        onPhotoChanged={onPhotoChanged}
      />
      <Separator />
      <PatientSummaryFields
        patient={patient}
        clinicalEvaluationsCount={clinicalEvaluationsCount}
        sessionNotesCount={sessionNotesCount}
        canEditMembers={canEditMembers}
        pending={pending}
        onEditMembers={onEditMembers}
      />
    </aside>
  );
}
