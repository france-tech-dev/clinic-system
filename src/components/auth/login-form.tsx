"use client";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { paths } from "@/shared/constants/paths";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSyncExternalStore, useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/shared/lib/auth-client";
import { Badge } from "../ui/badge";
import { IconBrandGoogle } from "@tabler/icons-react";

const formSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

export function LoginForm({
  className,
  accessNotice = null,
  ...props
}: React.ComponentPropsWithoutRef<"form"> & {
  accessNotice?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const lastMethod = useSyncExternalStore(
    () => () => {},
    () => authClient.getLastUsedLoginMethod() ?? null,
    () => null,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      // Via HTTP /api/auth — para o rate limit do Better Auth aplicar (auth.api.* não limita).
      const { error } = await authClient.signIn.email({
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

      toast.success("Login realizado com sucesso");
      router.push(paths.agenda);
    });
  };

  const signInWithGoogle = async () => {
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
          <h1 className="text-2xl font-bold">Acesse sua conta</h1>
          {accessNotice ? (
            <p className="text-sm text-destructive" role="alert">
              {accessNotice}
            </p>
          ) : null}
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative">
                    Endereço de e-mail *
                    {lastMethod === "email" && (
                      <Badge
                        variant="secondary"
                        className="absolute right-1 -top-2.25 text-xs"
                      >
                        Último uso
                      </Badge>
                    )}
                  </FormLabel>
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
            <Link
              href={paths.auth.forgotPassword}
              className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
            >
              Esqueceu sua senha?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Login
          </Button>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Ou continue com
            </span>
          </div>
          <Button
            variant="outline"
            className="relative w-full"
            type="button"
            onClick={signInWithGoogle}
          >
            <IconBrandGoogle className="size-4" />
            Login com Google
            {lastMethod === "google" && (
              <Badge
                variant="secondary"
                className="absolute right-1 -top-2.25 text-xs"
              >
                Último uso
              </Badge>
            )}
          </Button>
        </div>
        <div className="text-center text-sm">
          Não tem uma conta?{" "}
          <Link
            href={paths.auth.signup}
            className="underline underline-offset-4"
          >
            Criar conta
          </Link>
        </div>
      </form>
    </Form>
  );
}
