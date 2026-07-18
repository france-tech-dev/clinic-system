"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteSessionAction } from "@/features/patient/patient.actions";
import type {
  PatientDetailDTO,
  SessionNoteDTO,
} from "@/features/patient/patient.types";

export function usePatientSessions({
  setDetail,
  pending,
  startTransition,
}: {
  setDetail: React.Dispatch<React.SetStateAction<PatientDetailDTO>>;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const [sessionOpen, setSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionNoteDTO | null>(
    null,
  );
  const [viewSession, setViewSession] = useState<SessionNoteDTO | null>(null);

  function openNewSession() {
    setEditingSession(null);
    setSessionOpen(true);
  }

  function openEditSession(s: SessionNoteDTO) {
    setViewSession(null);
    setEditingSession(s);
    setSessionOpen(true);
  }

  function saveSession(s: SessionNoteDTO, isEdit: boolean) {
    setDetail((d) => ({
      ...d,
      sessionNotes: isEdit
        ? d.sessionNotes.map((x) => (x.id === s.id ? s : x))
        : [s, ...d.sessionNotes],
      appointments: d.appointments.map((a) => {
        if (a.id === s.appointmentId) {
          return { ...a, sessionNoteId: s.id };
        }
        if (a.sessionNoteId === s.id && a.id !== s.appointmentId) {
          return { ...a, sessionNoteId: null };
        }
        return a;
      }),
    }));
    setSessionOpen(false);
  }

  function deleteSession(id: string) {
    startTransition(async () => {
      const result = await deleteSessionAction({ id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDetail((d) => ({
        ...d,
        sessionNotes: d.sessionNotes.filter((s) => s.id !== id),
        appointments: d.appointments.map((a) =>
          a.sessionNoteId === id ? { ...a, sessionNoteId: null } : a,
        ),
      }));
      setViewSession(null);
      toast.success("Evolução removida");
    });
  }

  return {
    sessionOpen,
    setSessionOpen,
    editingSession,
    viewSession,
    setViewSession,
    openNewSession,
    openEditSession,
    saveSession,
    deleteSession,
    pending,
    startTransition,
  };
}
