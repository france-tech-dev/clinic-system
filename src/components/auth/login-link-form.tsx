"use client";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { paths } from "@/shared/constants/paths";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "@/shared/lib/auth-client";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.email("Email inválido"),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginLinkForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormValues) => {
    const { error } = await signIn.magicLink({
      email: data.email,
      callbackURL: paths.agenda,
    });

    if (error) {
      toast.error(error.message || "Erro ao enviar link de acesso");
      return;
    }

    toast.success("Link de acesso enviado com sucesso, verifique seu email");
  };

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login com link de acesso</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Digite seu email abaixo para receber um link de acesso
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Digite seu email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Enviar link de acesso</Button>
          <p className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link
              href={paths.auth.signup}
              className="underline underline-offset-4"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
