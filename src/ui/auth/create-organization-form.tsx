"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/shared/lib/auth-client";
import { paths } from "@/shared/constants/paths";
import { Spinner } from "../ui/spinner";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").trim(),
  slug: z
    .string()
    .min(3, "Identificador deve ter pelo menos 3 caracteres")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use apenas letras minúsculas, números e hífens",
    )
    .trim(),
});

function slugFromName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

type CreateOrganizationFormProps = {
  redirectTo?: string;
};

export function CreateOrganizationForm({
  redirectTo = paths.dashboard,
}: CreateOrganizationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.organization.create({
        name: values.name,
        slug: values.slug,
      });

      if (error) {
        toast.error(error.message || "Erro ao criar organização");
        return;
      }

      if (data?.id) {
        const { error: activeError } = await authClient.organization.setActive({
          organizationId: data.id,
        });
        if (activeError) {
          toast.error(
            activeError.message ||
              "Organização criada, mas não foi possível ativá-la",
          );
        }
      }

      toast.success("Clínica criada com sucesso");
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar organização");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da clínica *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Clínica Equilíbrio"
                  autoComplete="organization"
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                    if (!slugTouched) {
                      form.setValue("slug", slugFromName(value), {
                        shouldValidate: false,
                      });
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identificador (URL) *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="clinica-equilibrio"
                  onChange={(e) => {
                    setSlugTouched(true);
                    field.onChange(e.target.value.toLowerCase());
                  }}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Usado internamente para identificar a clínica. Pode editar se
                quiser.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isLoading} type="submit" className="w-full sm:w-auto">
          {isLoading ? <Spinner data-icon="inline-start" /> : null}
          Criar clínica
        </Button>
      </form>
    </Form>
  );
}
