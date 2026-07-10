"use client";
import { createEnrollmentGroup } from "@/API/leads/leads";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipAction } from "@/components/ui/tooltip-action";
import { cn } from "@/shared/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as zod from "zod";

const EQUIPE_MAPPING: Record<string, [number | null, number | null]> = {
  C1: [210, 493],
  C2: [2250, 5599],
  C3: [211, 494],
  C4: [212, 495],
  C5: [null, null],
  C6: [213, 496],
  Incubadora: [3026, 6657],
};

function getDepartamentoAndCargoByEquipe(
  equipeCode: string,
): [number | null, number | null] {
  return EQUIPE_MAPPING[equipeCode] ?? [null, null];
}

const formSchema = zod
  .object({
    codigo_externo: zod.string().optional(),
    url: zod.string().url("URL inválida").optional().or(zod.literal("")),
    nome: zod.string().min(1, "Nome é obrigatório"),
    email: zod.string().email("Email inválido"),
    emails: zod.string().optional(),
    ddd: zod
      .string()
      .regex(/^\d{2}$/, "DDD deve ter 2 dígitos")
      .optional()
      .or(zod.literal("")),
    telefone: zod
      .string()
      .regex(/^\d{8,9}$/, "Telefone deve ter 8 ou 9 dígitos")
      .optional()
      .or(zod.literal("")),
    cpf: zod.string().optional(),
    data_nascimento: zod
      .string()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato DD/MM/AAAA")
      .optional()
      .or(zod.literal("")),
    cep: zod
      .string()
      .regex(/^\d{8}$/, "CEP deve ter 8 dígitos")
      .optional()
      .or(zod.literal("")),
    endereco: zod.string().optional(),
    numero: zod.string().optional(),
    bairro: zod.string().optional(),
    estado: zod
      .string()
      .length(2, "Estado deve ter 2 caracteres (sigla)")
      .optional()
      .or(zod.literal("")),
    cidade: zod.string().optional(),
    complemento: zod.string().optional(),
    id_pais: zod.number().min(1, "País é obrigatório"),
    id_unidade: zod.number().min(1, "Unidade é obrigatória"),
    time_canais: zod.string().optional(),
    id_departamento: zod.number().min(1).nullable().optional(),
    id_cargo: zod.number().min(1).nullable().optional(),
    enviar_email_notificacao: zod.boolean().default(true),
  })
  .refine(
    (data) => {
      // Se time_canais for C5, id_departamento e id_cargo podem ser null
      if (data.time_canais === "C5") {
        return true;
      }
      // Caso contrário, id_departamento e id_cargo são obrigatórios
      if (data.time_canais && data.time_canais !== "") {
        return (
          data.id_departamento !== null &&
          data.id_departamento !== undefined &&
          data.id_cargo !== null &&
          data.id_cargo !== undefined
        );
      }
      // Se time_canais não foi selecionado, os campos são obrigatórios
      return (
        data.id_departamento !== null &&
        data.id_departamento !== undefined &&
        data.id_cargo !== null &&
        data.id_cargo !== undefined
      );
    },
    {
      message: "Departamento e Cargo são obrigatórios",
      path: ["id_departamento"],
    },
  );

export type EnrollmentFormValues = zod.infer<typeof formSchema>;

export type EnrollmentLead = {
  id?: string;
  codigo_externo?: string;
  url?: string;
  nome?: string;
  email?: string;
  emails?: string;
  ddd?: string | number;
  telefone?: string | number;
  cpf?: string;
  data_nascimento?: string;
  cep?: string | number;
  endereco?: string;
  numero?: string | number;
  bairro?: string;
  estado?: string;
  cidade?: string;
  complemento?: string;
  id_pais?: number;
  id_unidade?: number;
  time_canais?: string;
  id_departamento?: number | null;
  id_cargo?: number | null;
  enviar_email_notificacao?: number;
  [key: string]: unknown;
};

export function EnrollmentFormDialog({
  enrollment,
}: {
  enrollment?: EnrollmentLead | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      codigo_externo: enrollment?.codigo_externo || "",
      url: enrollment?.url || "",
      nome: enrollment?.nome || "",
      email: enrollment?.email || "",
      emails: enrollment?.emails || "",
      ddd: enrollment?.ddd?.toString() || "",
      telefone: enrollment?.telefone?.toString() || "",
      cpf: enrollment?.cpf || "",
      data_nascimento: enrollment?.data_nascimento || "",
      cep: enrollment?.cep?.toString() || "",
      endereco: enrollment?.endereco || "",
      numero: enrollment?.numero?.toString() || "",
      bairro: enrollment?.bairro || "",
      estado: enrollment?.estado || "",
      cidade: enrollment?.cidade || "",
      complemento: enrollment?.complemento || "",
      id_pais: enrollment?.id_pais || 1,
      id_unidade: enrollment?.id_unidade || 135,
      time_canais: enrollment?.time_canais || "",
      id_departamento: enrollment?.id_departamento,
      id_cargo: enrollment?.id_cargo,
      enviar_email_notificacao: enrollment?.enviar_email_notificacao === 1,
    },
    resolver: zodResolver(formSchema),
  });

  const { mutate: createMutation, isPending: isLoading } = useMutation({
    mutationFn: createEnrollmentGroup,
    onSuccess: () => {
      toast.success(
        enrollment
          ? "Parceiro atualizado com sucesso!"
          : "Parceiro criado com sucesso!",
      );
      form.reset();
      setIsOpen(false);
    },
    onError: () => {
      toast.error(
        "Erro ao salvar parceiro. Verifique os dados e tente novamente.",
      );
    },
  });

  const onSubmit = (data: EnrollmentFormValues) => {
    const dataToSend = Object.fromEntries(
      Object.entries(data).filter(([key]) => key !== "time_canais"),
    );
    const cleanedData = Object.fromEntries(
      Object.entries(dataToSend).map(([key, value]) => [
        key,
        value === "" ? undefined : value,
      ]),
    );
    createMutation(cleanedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipAction
        title={enrollment ? "Editar parceiro" : "Criar novo parceiro"}
        asChild
      >
        <DialogTrigger asChild>
          {enrollment ? (
            <Button variant="ghost" size="sm">
              <IconPencil className="h-4 w-4" />
            </Button>
          ) : (
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Novo Parceiro
            </Button>
          )}
        </DialogTrigger>
      </TooltipAction>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {enrollment ? "Editar Parceiro" : "Cadastrar Novo Parceiro"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do parceiro. Campos marcados com * são
            obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn("flex flex-col gap-6 space-y-6")}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nome <span className="text-destructive">*</span>
                    </FormLabel>
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
                    <FormLabel>
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="id_pais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      País <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o país" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Brasil</SelectItem>
                        <SelectItem value="2">Estados Unidos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="id_unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Unidade <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="ID da unidade"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time_canais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time de Canais</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const [id_departamento, id_cargo] =
                          getDepartamentoAndCargoByEquipe(value);
                        form.setValue("id_departamento", id_departamento);
                        form.setValue("id_cargo", id_cargo);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o time de canais" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="C1">C1</SelectItem>
                        <SelectItem value="C2">C2</SelectItem>
                        <SelectItem value="C3">C3</SelectItem>
                        <SelectItem value="C4">C4</SelectItem>
                        <SelectItem value="C5">C5</SelectItem>
                        <SelectItem value="C6">C6</SelectItem>
                        <SelectItem value="Incubadora">Incubadora</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="id_departamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Departamento <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="ID do departamento"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="id_cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cargo <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="ID do cargo"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigo_externo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Externo</FormLabel>
                    <FormControl>
                      <Input placeholder="Código externo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Foto/Avatar</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://exemplo.com/foto.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emails Adicionais</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email1@exemplo.com, email2@exemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ddd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DDD</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="11"
                        maxLength={2}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone/Celular</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="987654321"
                        maxLength={9}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          const formatted = value.replace(
                            /(\d{3})(\d{3})(\d{3})(\d{2})/,
                            "$1.$2.$3-$4",
                          );
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_nascimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="DD/MM/AAAA"
                        maxLength={10}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          const formatted = value.replace(
                            /(\d{2})(\d{2})(\d{4})/,
                            "$1/$2/$3",
                          );
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00000000"
                        maxLength={8}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, Avenida, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="123"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado (Sigla)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SP"
                        maxLength={2}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value.toUpperCase());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complemento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input placeholder="Apto, Bloco, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="enviar_email_notificacao"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="leading-none">
                    <FormLabel className="mt-0! cursor-pointer">
                      Enviar e-mail de boas-vindas
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading
                ? "Salvando..."
                : enrollment
                  ? "Atualizar Parceiro"
                  : "Criar Parceiro"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
