"use client";

import { useCallback, useState } from "react";
import type { CashTransactionDraft } from "@/features/finance/components/cash-transaction-form-dialog";
import type { AppointmentDTO } from "@/features/schedule/schedule.types";
import type { AppointmentStatusId } from "@/shared/constants/appointment";

export function buildCashDraftFromAppointment(
  appointment: AppointmentDTO,
): CashTransactionDraft {
  return {
    type: "income",
    date: appointment.date,
    patientId: appointment.patientId,
    memberId: appointment.memberId,
    description: `Sessão — ${appointment.patientName}`,
    amount: appointment.patientPrice,
  };
}

export function useAgendaCashflow(canSuggestCash: boolean) {
  const [cashDialogOpen, setCashDialogOpen] = useState(false);
  const [cashDraft, setCashDraft] = useState<CashTransactionDraft | null>(null);

  const openCashDialogForAppointment = useCallback((appointment: AppointmentDTO) => {
    setCashDraft(buildCashDraftFromAppointment(appointment));
    setCashDialogOpen(true);
  }, []);

  const closeCashDialog = useCallback(() => {
    setCashDialogOpen(false);
    setCashDraft(null);
  }, []);

  const onAppointmentStatusChanged = useCallback(
    (appointment: AppointmentDTO, status: AppointmentStatusId) => {
      if (status === "completed" && canSuggestCash) {
        openCashDialogForAppointment(appointment);
      }
    },
    [canSuggestCash, openCashDialogForAppointment],
  );

  return {
    cashDialogOpen,
    cashDraft,
    setCashDialogOpen,
    openCashDialogForAppointment,
    closeCashDialog,
    onAppointmentStatusChanged,
  };
}
