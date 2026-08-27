"use client";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { paths } from "@/shared/constants/paths";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "../ui/form";
import { toast } from "sonner";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { authClient } from "@/shared/lib/auth-client";
import { IconBrandGoogle } from "@tabler/icons-react";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").trim(),
  email: z.email("Email inválido").trim(),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").trim(),
  confirmPassword: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .trim(),
});

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (data.password !== data.confirmPassword) {
      form.setError("confirmPassword", {
        message: "As senhas não coincidem",
      });
      return;
    }

    startTransition(async () => {
      const { error } = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.status === 429) return;
        toast.error(
          error.message ||
            "Algo de errado aconteceu, tente novamente mais tarde.",
        );
        return;
      }

      toast.success(
        "Cadastro realizado com sucesso. Verifique seu email para ativar sua conta.",
      );
      router.push(paths.agenda);
    });
  };

  const signUpWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: paths.agenda,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold"> Crie sua conta</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Preencha o formulário abaixo para criar sua conta
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      type="text"
                      placeholder="João da Silva"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço de e-mail *</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Não compartilharemos seu e-mail com ninguém.
        </p>
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha *</FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    placeholder="A senha deve ter 8 caracteres"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Senha *</FormLabel>
                <FormControl>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme a senha"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Criar Conta
          </Button>
        </div>
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">Ou continue com</p>
        </div>
        <div className="grid gap-2">
          <Button variant="outline" type="button" onClick={signUpWithGoogle}>
            <IconBrandGoogle className="size-4" />
            Criar conta com Google
          </Button>
          <p className="text-center text-sm">
            Já tem uma conta?{" "}
            <Link
              href={paths.auth.login}
              className="underline underline-offset-4"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
