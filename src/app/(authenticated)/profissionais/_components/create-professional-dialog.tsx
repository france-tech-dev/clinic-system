"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  createProfessionalAction,
  listTeamMembersAction,
} from "@/features/team/team.actions";
import {
  createProfessionalSchema,
  TEAM_MEMBER_ROLES,
  type CreateProfessionalInput,
} from "@/features/team/team.schema";
import type { TeamMemberDTO } from "@/features/team/team.types";
import { DEFAULT_MEMBER_PASSWORD } from "@/shared/constants/auth";
import {
  getHealthProfession,
  HEALTH_PROFESSIONS,
} from "@/shared/constants/professions";

const ROLE_OPTIONS: {
  value: (typeof TEAM_MEMBER_ROLES)[number];
  label: string;
}[] = [
  { value: "MEMBER", label: "Membro" },
  { value: "MANAGER", label: "Gestor" },
  { value: "ADMIN", label: "Administrador" },
];

const DEFAULT_VALUES: CreateProfessionalInput = {
  name: "",
  email: "",
  profession: "terapeuta_ocupacional",
  registro: "",
  phone: "",
  birthDate: "",
  role: "MEMBER",
  password: DEFAULT_MEMBER_PASSWORD,
  confirmPassword: DEFAULT_MEMBER_PASSWORD,
};

export function CreateProfessionalDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (members: TeamMemberDTO[]) => void;
}) {
  const [pending, startTransition] = useTransition();

  const form = useForm<CreateProfessionalInput>({
    resolver: zodResolver(createProfessionalSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const professionId = form.watch("profession");
  const council = getHealthProfession(professionId)?.council ?? "Conselho";

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset(DEFAULT_VALUES);
    }
    onOpenChange(next);
  }

  function onSubmit(data: CreateProfessionalInput) {
    startTransition(async () => {
      const result = await createProfessionalAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const list = await listTeamMembersAction();
      if (list.success) {
        onCreated(list.data);
      }

      toast.success(
        "Profissional cadastrado. No primeiro login terá de alterar a senha.",
      );
      form.reset(DEFAULT_VALUES);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo profissional</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="create-professional-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-3"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
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
                  <FormLabel>E-mail</FormLabel>
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

            <div className="grid gap-3 sm:grid-cols-2">
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
                name="registro"
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

            <div className="grid gap-3 sm:grid-cols-2">
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
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Papel na clínica</FormLabel>
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
                      {ROLE_OPTIONS.map((r) => (
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

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha temporária</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              No primeiro login o profissional será obrigado a definir uma nova
              senha.
            </p>
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
            form="create-professional-form"
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Cadastrar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
