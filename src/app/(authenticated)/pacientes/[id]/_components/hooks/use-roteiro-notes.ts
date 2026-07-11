"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { saveRoteiroNoteAction } from "@/features/patient/patient.actions";
import type { RoteiroNoteDTO } from "@/features/patient/patient.types";
import {
  ROTEIROS,
  roteiroById,
  roteiroCategoryByTick,
  type RoteiroId,
} from "@/shared/constants/roteiros";
import type { AvaliacaoView } from "../patient-detail-types";

export function useRoteiroNotes({
  patientId,
  initialNotes,
  pending,
  startTransition,
}: {
  patientId: string;
  initialNotes: RoteiroNoteDTO[];
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const [avaliacaoView, setAvaliacaoView] = useState<AvaliacaoView>("lista");
  const [roteiroId, setRoteiroId] = useState<RoteiroId>("si");
  const [roteiroTick, setRoteiroTick] = useState(
    ROTEIROS[0].categories[0].tick,
  );
  const [roteiroNotes, setRoteiroNotes] = useState(initialNotes);
  const [roteiroDraft, setRoteiroDraft] = useState("");

  const currentRoteiro = roteiroById(roteiroId);
  const currentCategory = roteiroCategoryByTick(currentRoteiro, roteiroTick);
  const currentRoteiroNote = useMemo(
    () =>
      roteiroNotes.find(
        (n) =>
          n.roteiroId === roteiroId && n.categoryTick === currentCategory.tick,
      ),
    [roteiroNotes, roteiroId, currentCategory.tick],
  );

  function openRoteiro(id: RoteiroId) {
    const r = roteiroById(id);
    setRoteiroId(id);
    setRoteiroTick(r.categories[0].tick);
    const note = roteiroNotes.find(
      (n) => n.roteiroId === id && n.categoryTick === r.categories[0].tick,
    );
    setRoteiroDraft(note?.notes ?? "");
    setAvaliacaoView("roteiro");
  }

  function selectTick(tick: string) {
    setRoteiroTick(tick);
    const note = roteiroNotes.find(
      (n) => n.roteiroId === roteiroId && n.categoryTick === tick,
    );
    setRoteiroDraft(note?.notes ?? "");
  }

  function saveCurrentRoteiroNote() {
    startTransition(async () => {
      const result = await saveRoteiroNoteAction({
        patientId,
        roteiroId,
        categoryTick: currentCategory.tick,
        notes: roteiroDraft,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setRoteiroNotes((prev) => {
        const without = prev.filter(
          (n) =>
            !(
              n.roteiroId === result.data.roteiroId &&
              n.categoryTick === result.data.categoryTick
            ),
        );
        return [...without, result.data];
      });
      toast.success("Notas do roteiro salvas");
    });
  }

  return {
    avaliacaoView,
    setAvaliacaoView,
    roteiroId,
    roteiroDraft,
    setRoteiroDraft,
    currentRoteiro,
    currentCategory,
    currentRoteiroNote,
    openRoteiro,
    selectTick,
    saveCurrentRoteiroNote,
    pending,
  };
}
