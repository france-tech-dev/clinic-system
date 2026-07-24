"use client";

import { useFormContext } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EvaluationDialogValues } from "../evaluation-form-dialog";

export function EvaluationFormMetaFields() {
  const { control } = useFormContext<EvaluationDialogValues>();

  return (
    <>
      <div className="grid grid-cols-2 items-start gap-3">
        <FormField
          control={control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <Select
                value={field.value}
                onValueChange={(v) => field.onChange(v ?? field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Inicial">Avaliação inicial</SelectItem>
                  <SelectItem value="Reavaliação">Reavaliação</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data *</FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 items-start gap-3">
        <FormField
          control={control}
          name="diagnostico"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnóstico / CID</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: G80 – Paralisia cerebral"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="encaminhadoPor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Encaminhado por</FormLabel>
              <FormControl>
                <Input placeholder="Médico, escola, família…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
