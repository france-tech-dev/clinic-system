"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EvaluationDialogValues } from "../evaluation-form-dialog";

export function EvaluationFormPlanFields() {
  const { control } = useFormContext<EvaluationDialogValues>();

  return (
    <>
      <FormField
        control={control}
        name="equipamentos"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Uso de equipamentos / órteses</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="objetivos"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Objetivos terapêuticos</FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="condutas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Condutas / plano de intervenção</FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 items-start gap-3">
        <FormField
          control={control}
          name="frequencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequência proposta</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: 2x por semana, 50 min"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="criteriosAlta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Critérios de alta</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
