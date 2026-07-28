"use client";

import { useFormContext, useWatch } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import {
  PATIENT_SEXES,
  type PatientDraftInput,
} from "@/features/patient/patient.schema";
import type { PatientSex } from "@/features/patient/patient.types";
import {
  PATIENT_PRICING_TYPES,
  patientPriceFieldLabel,
} from "@/shared/constants/patient-pricing";

const SEX_LABEL: Record<PatientSex, string> = {
  female: "Feminino",
  male: "Masculino",
  other: "Outro",
  not_informed: "Não informado",
};

export function PatientFormFields() {
  const { control } = useFormContext<PatientDraftInput>();
  const pricingType = useWatch({ control, name: "pricingType" }) ?? "session";

  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de nascimento</FormLabel>
              <FormControl>
                <DatePicker
                  longRange
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sexo *</FormLabel>
              <Select
                value={field.value}
                onValueChange={(v) => field.onChange(v as PatientSex)}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PATIENT_SEXES.map((id) => (
                    <SelectItem key={id} value={id}>
                      {SEX_LABEL[id]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="pricingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cobrança *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PATIENT_PRICING_TYPES.map((item) => (
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
          control={control}
          name="priceInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{patientPriceFieldLabel(pricingType)}</FormLabel>
              <FormControl>
                <Input inputMode="decimal" placeholder="0,00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
