"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { changeForcedPasswordAction } from "@/features/team/team.actions";
import {
  changeForcedPasswordSchema,
  type ChangeForcedPasswordInput,
} from "@/features/team/team.schema";
import { paths } from "@/shared/constants/paths";
import { cn } from "@/shared/lib/utils";

export function ChangePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<ChangeForcedPasswordInput>({
    resolver: zodResolver(changeForcedPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: ChangeForcedPasswordInput) {
    startTransition(async () => {
      const result = await changeForcedPasswordAction(data);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Senha atualizada");
      router.push(paths.agenda);
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Definir nova senha</h1>
          <p className="text-sm text-muted-foreground">
            Por segurança, altere a senha temporária antes de continuar.
          </p>
        </div>

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova senha *</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
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
              <FormLabel>Confirmar nova senha *</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <Spinner data-icon="inline-start" /> : null}
          Confirmar
        </Button>
      </form>
    </Form>
  );
}
