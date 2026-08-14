"use client";

import { useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  saveCurrentMemberProfessionalAction,
  saveProfessionalAction,
} from "@/features/settings/settings.actions";
import {
  memberProfessionalSchema,
  professionalProfileSchema,
} from "@/features/settings/settings.schema";
import type { ProfessionalProfile } from "@/features/settings/settings.types";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";

type ProfileFormValues = {
  name: string;
  registration: string;
  clinic?: string;
};

export function ProfessionalProfileForm({
  initial,
  mode,
  title = "Dados do profissional",
  description,
  saveLabel = "Salvar",
  onSaved,
}: {
  initial: { name: string; registration: string; clinic?: string };
  mode: "member" | "org";
  title?: string;
  description?: string;
  saveLabel?: string;
  onSaved?: (data: ProfessionalProfile) => void;
}) {
  const [pending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(
      mode === "org" ? professionalProfileSchema : memberProfessionalSchema,
    ) as Resolver<ProfileFormValues>,
    defaultValues:
      mode === "org"
        ? {
            name: initial.name,
            registration: initial.registration,
            clinic: initial.clinic ?? "",
          }
        : {
            name: initial.name,
            registration: initial.registration,
          },
  });

  function onSubmit(data: ProfileFormValues) {
    startTransition(async () => {
      const result =
        mode === "org"
          ? await saveProfessionalAction({
              name: data.name,
              registration: data.registration,
              clinic: data.clinic ?? initial.clinic ?? "",
            })
          : await saveCurrentMemberProfessionalAction({
              name: data.name,
              registration: data.registration,
            });

      if (!result.success) {
        applyActionFieldErrors(form.setError, result.fieldErrors);
        toast.error(result.message);
        return;
      }

      if (mode === "org") {
        form.reset({
          name: result.data.name,
          registration: result.data.registration,
          clinic: result.data.clinic,
        });
        toast.success("Perfil da clínica salvo");
      } else {
        form.reset({
          name: result.data.name,
          registration: result.data.registration,
        });
        toast.success("Seu CREFITO foi salvo");
      }

      onSaved?.(result.data);
    });
  }

  return (
    <div className="max-w-lg space-y-4 rounded-md border border-border bg-card p-4">
      <div className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do terapeuta</FormLabel>
                <FormControl>
                  <Input placeholder="Seu name completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registro (CREFITO)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: CREFITO-3 000000-TO"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {saveLabel}
          </Button>
        </form>
      </Form>
    </div>
  );
}
