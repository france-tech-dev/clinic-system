"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MemberPatientsIndicator } from "@/features/team/components/member-patients-indicator";
import { updateOwnProfileAction } from "@/domains/team/team.actions";
import {
  updateOwnProfileSchema,
  type UpdateOwnProfileInput,
} from "@/domains/team/team.schema";
import type { TeamMemberDTO } from "@/domains/team/team.types";
import { getHealthProfession } from "@/shared/constants/professions";
import { memberRoleLabel } from "@/shared/constants/member-role";
import { memberStatusLabel } from "@/shared/constants/member-status";
import { formatProfessionalSignature } from "@/shared/types/professional";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";

function toFormValues(member: TeamMemberDTO): UpdateOwnProfileInput {
  return {
    name: member.name,
    email: member.email,
    registration: member.registration ?? "",
    phone: member.phone ?? "",
    birthDate: member.birthDate ?? "",
  };
}

export function OwnProfileForm({
  initial,
}: {
  initial: TeamMemberDTO;
}) {
  const [member, setMember] = useState(initial);
  const [pending, startTransition] = useTransition();

  const form = useForm<UpdateOwnProfileInput>({
    resolver: zodResolver(updateOwnProfileSchema),
    defaultValues: toFormValues(initial),
  });

  const watchedName = useWatch({ control: form.control, name: "name" }) ?? "";
  const watchedRegistration =
    useWatch({ control: form.control, name: "registration" }) ?? "";
  const isDirty = form.formState.isDirty;

  const profession = getHealthProfession(member.profession);
  const council = profession?.council ?? "Conselho";
  const signaturePreview = formatProfessionalSignature({
    name: watchedName,
    registration: watchedRegistration,
    clinic: "",
  });

  function onSubmit(data: UpdateOwnProfileInput) {
    startTransition(async () => {
      const result = await updateOwnProfileAction(data);
      if (!result.success) {
        applyActionFieldErrors(form.setError, result.fieldErrors);
        toast.error(result.message);
        return;
      }
      setMember(result.data);
      form.reset(toFormValues(result.data));
      toast.success("Perfil atualizado");
    });
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium">Dados pessoais</h2>
          <p className="text-sm text-muted-foreground">
            Nome e registo entram na assinatura dos PDFs das avaliações que
            você criar.
          </p>
        </div>

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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="profissional@clinica.com"
                      {...field}
                    />
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
                  <FormLabel>Registo ({council})</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`Ex.: ${council}-3 000000`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid items-start gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aniversário</FormLabel>
                    <FormControl>
                      <DatePicker
                        longRange
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={pending || !isDirty}>
                {pending ? <Spinner data-icon="inline-start" /> : null}
                Salvar perfil
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

      <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium">Na clínica</h2>
          <p className="text-sm text-muted-foreground">
            Definidos pela liderança — só consulta.
          </p>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Profissão</dt>
            <dd className="font-medium">
              {profession?.label ?? "Não definida"}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Papel</dt>
            <dd className="font-medium">
              {memberRoleLabel(member.role)}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium">
              {memberStatusLabel(member.status)}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:col-span-2">
            <dt className="text-muted-foreground">Pacientes</dt>
            <dd className="pt-1">
              <MemberPatientsIndicator
                memberName={member.name}
                patients={member.patients}
                canEdit={false}
              />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
