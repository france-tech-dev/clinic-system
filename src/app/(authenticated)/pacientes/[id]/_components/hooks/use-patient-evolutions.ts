"use client";

import { deleteEvolutionAction } from "@/domains/evolution/evolution.actions";
import type {
  EvolutionDTO,
  LinkableAppointmentDTO,
} from "@/domains/evolution/evolution.types";
import { useState } from "react";
import { toast } from "sonner";

export function usePatientEvolutions({
  setEvolutions,
  setAppointments,
  pending,
  startTransition,
}: {
  setEvolutions: React.Dispatch<React.SetStateAction<EvolutionDTO[]>>;
  setAppointments: React.Dispatch<
    React.SetStateAction<LinkableAppointmentDTO[]>
  >;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const [sessionOpen, setSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<EvolutionDTO | null>(
    null,
  );
  const [viewSession, setViewSession] = useState<EvolutionDTO | null>(null);

  function openNewSession() {
    setEditingSession(null);
    setSessionOpen(true);
  }

  function openEditSession(s: EvolutionDTO) {
    setViewSession(null);
    setEditingSession(s);
    setSessionOpen(true);
  }

  function saveSession(s: EvolutionDTO, isEdit: boolean) {
    setEvolutions((list) =>
      isEdit ? list.map((x) => (x.id === s.id ? s : x)) : [s, ...list],
    );
    setAppointments((list) =>
      list.map((a) => {
        if (a.id === s.appointmentId) {
          return { ...a, evolutionId: s.id };
        }
        if (a.evolutionId === s.id && a.id !== s.appointmentId) {
          return { ...a, evolutionId: null };
        }
        return a;
      }),
    );
    setSessionOpen(false);
  }

  function deleteSession(id: string) {
    startTransition(async () => {
      const result = await deleteEvolutionAction({ id });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setEvolutions((list) => list.filter((s) => s.id !== id));
      setAppointments((list) =>
        list.map((a) =>
          a.evolutionId === id ? { ...a, evolutionId: null } : a,
        ),
      );
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
