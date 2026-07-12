"use client";

import Link from "next/link";
import type { AppointmentDTO } from "@/features/schedule/schedule.types";
import {
  APPOINTMENT_STATUSES,
  appointmentStatusInfo,
  formatTime,
  type AppointmentStatusId,
} from "@/shared/constants/appointment";
import { appointmentDisplayColor } from "@/features/schedule/_lib/appointment-calendar-utils";
import { paths } from "@/shared/constants/paths";

export function AppointmentRow({
  appointment,
  pending,
  onEdit,
  onStatus,
}: {
  appointment: AppointmentDTO;
  pending: boolean;
  onEdit: (a: AppointmentDTO) => void;
  onStatus: (id: string, status: AppointmentStatusId) => void;
}) {
  const st = appointmentStatusInfo(appointment.status);
  const badgeColor = appointmentDisplayColor(
    appointment.status,
    appointment.hasSessionNote,
  );
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
            style={{ background: badgeColor }}
          >
            {appointment.hasSessionNote ? "Com evolução" : st.label}
          </span>
        </div>
        <p className="mt-0.5 font-medium">
          <Link
            href={paths.paciente(appointment.patientId)}
            className="hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {appointment.patientName}
          </Link>
        </p>
        {appointment.notes && (
          <p className="text-xs text-muted-foreground">{appointment.notes}</p>
        )}
      </button>
      <select
        className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
        value={appointment.status}
        disabled={pending}
        onChange={(e) =>
          onStatus(appointment.id, e.target.value as AppointmentStatusId)
        }
      >
        {APPOINTMENT_STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </li>
  );
}
