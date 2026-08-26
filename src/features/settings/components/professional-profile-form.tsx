"use client";

import { useTransition } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
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
} from "@/domains/settings/settings.actions";
import {
  memberProfessionalSchema,
  professionalProfileSchema,
} from "@/domains/settings/settings.schema";
import {
  formatProfessionalSignature,
  type ProfessionalProfile,
} from "@/domains/settings/settings.types";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";

type ProfileFormValues = {
  name: string;
  registration: string;
  clinic?: string;
};

export function ProfessionalProfileForm({
  initial,
  mode,
  title,
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

  const watchedName = useWatch({ control: form.control, name: "name" }) ?? "";
  const watchedRegistration =
    useWatch({ control: form.control, name: "registration" }) ?? "";
  const watchedClinic =
    useWatch({ control: form.control, name: "clinic" }) ?? "";
  const isDirty = form.formState.isDirty;
  const signaturePreview = formatProfessionalSignature({
    name: watchedName,
    registration: watchedRegistration,
    clinic: mode === "org" ? watchedClinic : (initial.clinic ?? ""),
  });

  function onSubmit(data: ProfileFormValues) {
    startTransition(async () => {
      const result =
        mode === "org"
          ? await saveProfessionalAction({
              name: data.name,
              registration: data.registration,
              clinic: data.clinic ?? "",
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
        toast.success("Assinatura padrão salva");
      } else {
        form.reset({
          name: result.data.name,
          registration: result.data.registration,
        });
        toast.success("Perfil profissional salvo");
      }

      onSaved?.(result.data);
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
      {title || description ? (
        <div className="flex flex-col gap-1">
          {title ? <h3 className="text-sm font-medium">{title}</h3> : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}

      <div
        className="rounded-md border border-border bg-background px-3 py-2"
        aria-live="polite"
      >
        <p className="text-xs text-muted-foreground">
          Pré-visualização da assinatura
        </p>
        <p className="text-sm font-medium">{signaturePreview}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do profissional</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
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
                <FormLabel>Registo profissional</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex.: CREFITO-3 000000-TO"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === "org" ? (
            <FormField
              control={form.control}
              name="clinic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clínica na assinatura</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Opcional — nome curto na linha de assinatura"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={pending || !isDirty}>
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {saveLabel}
            </Button>
            {isDirty ? (
              <p className="text-xs text-muted-foreground">
                Alterações por guardar
              </p>
            ) : null}
          </div>
        </form>
      </Form>
    </div>
  );
}
