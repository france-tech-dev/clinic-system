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

export function ClinicalEvaluationFormClinicalFields() {
  const { control } = useFormContext<ClinicalEvaluationDialogValues>();

  return (
    <>
      <FormField
        control={control}
        name="complaint"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Queixa principal / motivo</FormLabel>
            <FormControl>
              <Textarea rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="history"
        render={({ field }) => (
          <FormItem>
            <FormLabel>História clínica / ocupacional</FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="familyContext"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contexto familiar e social</FormLabel>
            <FormControl>
              <Textarea rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="previousLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nível de função prévio</FormLabel>
            <FormControl>
              <Textarea rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 items-start gap-3">
        <FormField
          control={control}
          name="medications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medicações em uso</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="precautions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precauções / contraindicações</FormLabel>
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
