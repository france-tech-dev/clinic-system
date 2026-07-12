"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createCashTransactionAction,
  deleteCashTransactionAction,
  updateCashTransactionAction,
} from "@/features/finance/finance.actions";
import type { CashTransactionDTO } from "@/features/finance/finance.types";
import type { PatientDTO } from "@/features/patient/patient.types";
import {
  CASH_PAYMENT_METHODS,
  CASH_TRANSACTION_TYPES,
  type CashPaymentMethodId,
  type CashTransactionTypeId,
} from "@/shared/constants/cash";
import { centsToBrlInput, parseBrlToCents } from "@/shared/lib/money-utils";

export function CashTransactionFormDialog({
  open,
  onOpenChange,
  patients,
  initial,
  defaultDate,
  defaultType,
  pending,
  startTransition,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: PatientDTO[];
  initial: CashTransactionDTO | null;
  defaultDate: string;
  defaultType?: CashTransactionTypeId;
  pending: boolean;
  startTransition: (fn: () => void) => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<CashTransactionTypeId>(
    initial?.type ?? defaultType ?? "entrada",
  );
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amountInput, setAmountInput] = useState(
    initial ? centsToBrlInput(initial.amountCents) : "",
  );
  const [paymentMethod, setPaymentMethod] = useState<CashPaymentMethodId>(
    initial?.paymentMethod ?? "dinheiro",
  );
  const [patientId, setPatientId] = useState<string | null>(
    initial?.patientId ?? null,
  );

  function submit() {
    const amountCents = parseBrlToCents(amountInput);
    if (amountCents === null) {
      toast.error("Informe um valor válido");
      return;
    }

    startTransition(async () => {
      const payload = {
        type,
        date,
        description,
        amountCents,
        paymentMethod,
        patientId,
      };

      const result = initial
        ? await updateCashTransactionAction({ id: initial.id, ...payload })
        : await createCashTransactionAction(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        initial ? "Lançamento atualizado" : "Lançamento registrado",
      );
      onSaved();
      onOpenChange(false);
    });
  }

  function handleDelete() {
    if (!initial) return;
    startTransition(async () => {
      const result = await deleteCashTransactionAction({ id: initial.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Lançamento removido");
      onSaved();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {initial ? "Editar lançamento" : "Novo lançamento"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Tipo</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as CashTransactionTypeId)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CASH_TRANSACTION_TYPES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="cash-date">Data</Label>
              <Input
                id="cash-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cash-amount">Valor (R$)</Label>
              <Input
                id="cash-amount"
                inputMode="decimal"
                placeholder="0,00"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="cash-description">Descrição</Label>
            <Input
              id="cash-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Sessão de terapia ocupacional"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Forma de pagamento</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) =>
                  setPaymentMethod(v as CashPaymentMethodId)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CASH_PAYMENT_METHODS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Paciente (opcional)</Label>
              <Select
                value={patientId ?? "none"}
                onValueChange={(v) => setPatientId(v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {initial ? (
            <DeleteConfirmDialog
              title="Excluir lançamento?"
              description="Esta ação não pode ser desfeita. O lançamento será removido permanentemente do caixa."
              onConfirm={handleDelete}
              disabled={pending}
            >
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={pending}
              >
                <Trash2 className="size-4" />
                Excluir
              </Button>
            </DeleteConfirmDialog>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button disabled={pending} onClick={submit}>
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
