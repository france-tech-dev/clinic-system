"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { EntityCombobox } from "@/components/entity-combobox";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  cashTransactionDraftSchema,
  type CashTransactionDraftInput,
} from "@/features/finance/finance.schema";
import type { CashTransactionDTO } from "@/features/finance/finance.types";
import type { PatientOption } from "@/shared/types/patient-option";
import {
  CASH_PAYMENT_METHODS,
  CASH_TRANSACTION_TYPES,
  type CashPaymentMethodId,
  type CashTransactionTypeId,
} from "@/shared/constants/cash";
import { amountToBrlInput, parseBrl } from "@/shared/lib/money-utils";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";

export type CashTransactionDraft = {
  type?: CashTransactionTypeId;
  date?: string;
  description?: string;
  amount?: number | null;
  paymentMethod?: CashPaymentMethodId;
  patientId?: string | null;
  memberId?: string | null;
};

function buildDefaults(
  initial: CashTransactionDTO | null,
  draft: CashTransactionDraft | null | undefined,
  defaultDate: string,
  defaultType: CashTransactionTypeId | undefined,
  defaultMemberId: string | undefined,
): CashTransactionDraftInput {
  const amount = initial?.amount ?? draft?.amount ?? null;
  return {
    type: initial?.type ?? draft?.type ?? defaultType ?? "income",
    date: initial?.date ?? draft?.date ?? defaultDate,
    description: initial?.description ?? draft?.description ?? "",
    amountInput: amount ? amountToBrlInput(amount) : "",
    paymentMethod:
      initial?.paymentMethod ?? draft?.paymentMethod ?? "cash",
    patientId: initial?.patientId ?? draft?.patientId ?? "none",
    memberId:
      initial?.memberId ?? draft?.memberId ?? defaultMemberId ?? "none",
  };
}

export function CashTransactionFormDialog({
  open,
  onOpenChange,
  patients,
  members,
  initial,
  draft,
  defaultDate,
  defaultType,
  defaultMemberId,
  pending,
  startTransition,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: PatientOption[];
  members: { id: string; name: string }[];
  initial: CashTransactionDTO | null;
  draft?: CashTransactionDraft | null;
  defaultDate: string;
  defaultType?: CashTransactionTypeId;
  defaultMemberId?: string;
  pending: boolean;
  startTransition: (fn: () => void) => void;
  onSaved: () => void;
}) {
  const defaults = buildDefaults(
    initial,
    draft,
    defaultDate,
    defaultType,
    defaultMemberId,
  );

  const form = useForm<CashTransactionDraftInput>({
    resolver: zodResolver(cashTransactionDraftSchema),
    defaultValues: defaults,
  });

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset(defaults);
    }
    onOpenChange(next);
  }

  function onSubmit(data: CashTransactionDraftInput) {
    const amount = parseBrl(data.amountInput);
    if (amount === null) {
      form.setError("amountInput", {
        type: "manual",
        message: "Informe um valor válido",
      });
      return;
    }

    startTransition(async () => {
      const payload = {
        type: data.type,
        date: data.date,
        description: data.description,
        amount,
        paymentMethod: data.paymentMethod,
        patientId: data.patientId === "none" ? null : data.patientId,
        memberId: data.memberId === "none" ? null : data.memberId,
      };

      const result = initial
        ? await updateCashTransactionAction({ id: initial.id, ...payload })
        : await createCashTransactionAction(payload);

      if (!result.success) {
        const fieldErrors = result.fieldErrors
          ? Object.fromEntries(
              Object.entries(result.fieldErrors).map(([key, message]) => [
                key === "amount" ? "amountInput" : key,
                message,
              ]),
            )
          : undefined;
        applyActionFieldErrors(form.setError, fieldErrors);
        toast.error(result.message);
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
        toast.error(result.message);
        return;
      }
      toast.success("Lançamento removido");
      onSaved();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {initial ? "Editar lançamento" : "Novo lançamento"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="cash-transaction-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      if (v) field.onChange(v);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CASH_TRANSACTION_TYPES.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid items-start gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <DatePicker
                        id="cash-date"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amountInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$) *</FormLabel>
                    <FormControl>
                      <Input
                        id="cash-amount"
                        inputMode="decimal"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Input
                      id="cash-description"
                      placeholder="Ex: Sessão de terapia ocupacional"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid items-start gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de pagamento *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        if (v) field.onChange(v);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CASH_PAYMENT_METHODS.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente (opcional)</FormLabel>
                    <FormControl>
                      <EntityCombobox
                        options={patients}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Nenhum"
                        emptyText="Nenhum paciente encontrado"
                        extraOption={{ id: "none", name: "Nenhum" }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {members.length > 0 ? (
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional (opcional)</FormLabel>
                    <FormControl>
                      <EntityCombobox
                        options={members}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Nenhum"
                        emptyText="Nenhum profissional encontrado"
                        extraOption={{ id: "none", name: "Nenhum" }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </form>
        </Form>

        <DialogFooter className="gap-2 sm:justify-between">
          {initial ? (
            <DeleteConfirmDialog
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
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="cash-transaction-form"
              disabled={pending}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
