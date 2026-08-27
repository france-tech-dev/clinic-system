"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
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
  listTeamMembersAction,
  updateProfessionalAction,
} from "@/domains/team/team.actions";
import {
  updateProfessionalSchema,
  type UpdateProfessionalInput,
} from "@/domains/team/team.schema";
import type { TeamMemberDTO } from "@/domains/team/team.types";
import {
  getHealthProfession,
  HEALTH_PROFESSION_IDS,
  HEALTH_PROFESSIONS,
} from "@/shared/constants/professions";
import {
  ASSIGNABLE_MEMBER_ROLE_OPTIONS,
  MEMBER_ROLE_OPTIONS,
} from "@/shared/constants/member-role";
import { MEMBER_STATUS_OPTIONS } from "@/shared/constants/member-status";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";
import { MemberStatus, Role } from "@prisma/enums";

function toFormValues(member: TeamMemberDTO): UpdateProfessionalInput {
  const role =
    member.role === Role.OWNER ||
    member.role === Role.ADMIN ||
    member.role === Role.MANAGER ||
    member.role === Role.MEMBER
      ? member.role
      : Role.MEMBER;

  const profession = HEALTH_PROFESSION_IDS.includes(
    member.profession as (typeof HEALTH_PROFESSION_IDS)[number],
  )
    ? (member.profession as UpdateProfessionalInput["profession"])
    : "terapeuta_ocupacional";

  return {
    memberId: member.id,
    name: member.name,
    email: member.email,
    profession,
    registration: member.registration ?? "",
    phone: member.phone ?? "",
    birthDate: member.birthDate ?? "",
    role,
    status: member.status,
  };
}

export function EditProfessionalDialog({
  member,
  open,
  onOpenChange,
  onUpdated,
}: {
  member: TeamMemberDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (members: TeamMemberDTO[]) => void;
}) {
  const [pending, startTransition] = useTransition();
  const isOwner = member?.role === Role.OWNER;

  const form = useForm<UpdateProfessionalInput>({
    resolver: zodResolver(updateProfessionalSchema),
    values: member ? toFormValues(member) : undefined,
    defaultValues: {
      memberId: "",
      name: "",
      email: "",
      profession: "terapeuta_ocupacional",
      registration: "",
      phone: "",
      birthDate: "",
      role: "MEMBER",
      status: MemberStatus.ACTIVE,
    },
  });

  const professionId = useWatch({
    control: form.control,
    name: "profession",
  });
  const council = getHealthProfession(professionId)?.council ?? "Conselho";

  function handleOpenChange(next: boolean) {
    if (!next && member) {
      form.reset(toFormValues(member));
    }
    onOpenChange(next);
  }

  function onSubmit(data: UpdateProfessionalInput) {
    startTransition(async () => {
      const result = await updateProfessionalAction(data);
      if (!result.success) {
        applyActionFieldErrors(form.setError, result.fieldErrors);
        toast.error(result.message);
        return;
      }

      const list = await listTeamMembersAction();
      if (list.success) {
        onUpdated(list.data);
      }

      toast.success("Profissional atualizado.");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar profissional</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="edit-professional-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-3"
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

            <div className="grid items-start gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissão</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        if (v) field.onChange(v);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HEALTH_PROFESSIONS.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.label}
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
                name="registration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registro ({council})</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Ex: ${council}-3 000000`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid items-start gap-3 sm:grid-cols-2">
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
                    <FormLabel>Aniversário *</FormLabel>
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
            </div>

            <div className="grid items-start gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Papel na clínica *</FormLabel>
                    <Select
                      value={field.value}
                      disabled={isOwner}
                      onValueChange={(v) => {
                        if (v) field.onChange(v);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(isOwner
                          ? MEMBER_ROLE_OPTIONS
                          : ASSIGNABLE_MEMBER_ROLE_OPTIONS
                        ).map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status na clínica *</FormLabel>
                    <Select
                      value={field.value}
                      disabled={isOwner}
                      onValueChange={(v) => {
                        if (v) field.onChange(v);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MEMBER_STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isOwner ? (
              <p className="text-xs text-muted-foreground">
                O proprietário mantém o papel e permanece ativo.
              </p>
            ) : null}
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="edit-professional-form"
            disabled={pending || !member}
          >
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
