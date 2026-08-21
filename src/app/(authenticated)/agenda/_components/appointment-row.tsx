"use client";

import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import type { AppointmentDTO } from "@/features/schedule/schedule.types";
import {
  APPOINTMENT_STATUSES,
  appointmentStatusInfo,
  formatTime,
} from "@/shared/constants/appointment";
import { paths } from "@/shared/constants/paths";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppointmentStatus } from "../../../../../prisma/generated/prisma/enums";

export function AppointmentRow({
  appointment,
  pending,
  onEdit,
  onStatus,
}: {
  appointment: AppointmentDTO;
  pending: boolean;
  onEdit: (a: AppointmentDTO) => void;
  onStatus: (id: string, status: AppointmentStatus) => void;
}) {
  const st = appointmentStatusInfo(appointment.status);
  const isScheduled = appointment.status === AppointmentStatus.SCHEDULED;

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2.5">
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => onEdit(appointment)}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-medium">
            {formatTime(appointment.time)}
          </span>
          {appointment.duration > 0 && (
            <span className="text-xs text-muted-foreground">
              {appointment.duration} min
            </span>
          )}
          <span
            className="rounded-full px-2 py-0.5 text-[0.65rem] font-medium text-white"
            style={{ background: st.color }}
          >
            {st.label}
          </span>
          {appointment.hasSessionNote ? (
            <span className="rounded-full border border-[#3D6B8C]/40 bg-[#3D6B8C]/15 px-2 py-0.5 text-[0.65rem] font-medium text-[#3D6B8C]">
              Com evolução
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 font-medium">
          <span className="font-normal text-muted-foreground">
            {appointment.professionalName}
            {" · "}
          </span>
          <Link
            href={paths.paciente(appointment.patientId)}
            className="hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {appointment.patientName}
          </Link>
        </p>
        {appointment.notes ? (
          <p className="text-xs text-muted-foreground">{appointment.notes}</p>
        ) : null}
      </button>

      <div className="flex flex-wrap items-center gap-2">
        {isScheduled ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() => onStatus(appointment.id, AppointmentStatus.COMPLETED)}
          >
            <Check data-icon="inline-start" />
            Realizado
          </Button>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              aria-label={`Alterar status de ${appointment.patientName}`}
            >
              Status
              <ChevronDown data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {APPOINTMENT_STATUSES.map((s) => (
              <DropdownMenuItem
                key={s.id}
                disabled={s.id === appointment.status}
                onClick={() => onStatus(appointment.id, s.id)}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: s.color }}
                  aria-hidden
                />
                {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}
