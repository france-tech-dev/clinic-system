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
import type { ClinicalEvaluationDialogValues } from "./clinical-evaluation-form-types";

export function ClinicalEvaluationFormPlanFields() {
  const { control } = useFormContext<ClinicalEvaluationDialogValues>();

  return (
    <>
      <FormField
        control={control}
        name="equipment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Uso de equipment / órteses</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="goals"
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
        name="interventions"
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
          name="frequency"
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
          name="dischargeCriteria"
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
