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

export function useRoteiroNotes({
  patientId,
  initialNotes,
  initialRoteiroId = ROTEIROS[0].id,
  pending,
  startTransition,
}: {
  patientId: string;
  initialNotes: RoteiroNoteDTO[];
  initialRoteiroId?: RoteiroId;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const [roteiroId, setRoteiroId] = useState<RoteiroId>(initialRoteiroId);
  const [roteiroTick, setRoteiroTick] = useState(
    roteiroById(initialRoteiroId).categories[0].tick,
  );
  const [roteiroNotes, setRoteiroNotes] = useState(initialNotes);
  const [roteiroDraft, setRoteiroDraft] = useState(
    () =>
      initialNotes.find(
        (n) =>
          n.roteiroId === initialRoteiroId &&
          n.categoryTick === roteiroById(initialRoteiroId).categories[0].tick,
      )?.notes ?? "",
  );

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
  }

  function selectTick(tick: string) {
    setRoteiroTick(tick);
    const note = roteiroNotes.find(
      (n) => n.roteiroId === roteiroId && n.categoryTick === tick,
    );
    setRoteiroDraft(note?.notes ?? "");
  }

  function replaceNotes(notes: RoteiroNoteDTO[], nextRoteiroId?: RoteiroId) {
    const id = nextRoteiroId ?? roteiroId;
    const r = roteiroById(id);
    const tick = r.categories[0].tick;
    setRoteiroNotes(notes);
    setRoteiroId(id);
    setRoteiroTick(tick);
    setRoteiroDraft(
      notes.find((n) => n.roteiroId === id && n.categoryTick === tick)?.notes ??
        "",
    );
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
        toast.error(result.message);
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
    roteiroId,
    roteiroDraft,
    setRoteiroDraft,
    currentRoteiro,
    currentCategory,
    currentRoteiroNote,
    openRoteiro,
    selectTick,
    replaceNotes,
    saveCurrentRoteiroNote,
    pending,
  };
}
