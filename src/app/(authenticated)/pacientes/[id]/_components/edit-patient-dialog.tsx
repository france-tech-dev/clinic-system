"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PatientPricingType } from "@/features/patient/patient.types";
import {
  PATIENT_PRICING_TYPES,
  patientPriceFieldLabel,
} from "@/shared/constants/patient-pricing";
import { centsToBrlInput, parseBrlToCents } from "@/shared/lib/money-utils";

export function EditPatientDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  notes,
  onNotesChange,
  pricingType,
  onPricingTypeChange,
  priceInput,
  onPriceInputChange,
  pending,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  pricingType: PatientPricingType;
  onPricingTypeChange: (value: PatientPricingType) => void;
  priceInput: string;
  onPriceInputChange: (value: string) => void;
  pending: boolean;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Editar paciente</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => onNameChange(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Observações</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Cobrança</Label>
              <Select
                value={pricingType}
                onValueChange={(v) =>
                  onPricingTypeChange(v as PatientPricingType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PATIENT_PRICING_TYPES.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>{patientPriceFieldLabel(pricingType)}</Label>
              <Input
                inputMode="decimal"
                placeholder="0,00"
                value={priceInput}
                onChange={(e) => onPriceInputChange(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={pending || !name.trim()} onClick={onSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function parsePatientPriceInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return parseBrlToCents(trimmed);
}

export function formatPatientPriceInput(cents: number | null): string {
  if (cents === null || cents <= 0) return "";
  return centsToBrlInput(cents);
}
