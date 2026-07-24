"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { GuardianDraftInput } from "@/features/guardian/guardian.schema";
import { DEFAULT_MEMBER_PASSWORD } from "@/shared/constants/auth";

export function GuardianFormFields({
  showPortalAccess = false,
}: {
  /** Mostra checkbox + senha temporária (criação / ativar portal). */
  showPortalAccess?: boolean;
}) {
  const { control } = useFormContext<GuardianDraftInput>();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium">Responsável</p>

      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl>
              <Input placeholder="Nome do responsável" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="(11) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail *</FormLabel>
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
      </div>

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input placeholder="000.000.000-00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="insurance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Convênio *</FormLabel>
              <FormControl>
                <Input placeholder="particular" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço</FormLabel>
            <FormControl>
              <Input placeholder="Rua, número, bairro, cidade" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="zipCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEP</FormLabel>
            <FormControl>
              <Input placeholder="00000-000" className="max-w-40" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="motherName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da mãe</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="motherCpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF da mãe</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="fatherName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do pai</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="fatherCpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF do pai</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {showPortalAccess ? (
        <>
          <FormField
            control={control}
            name="enablePortalAccess"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Criar acesso ao portal do responsável
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <PortalPasswordFields />
        </>
      ) : null}
    </div>
  );
}

function PortalPasswordFields() {
  const { control, watch } = useFormContext<GuardianDraftInput>();
  const enablePortalAccess = watch("enablePortalAccess");

  if (!enablePortalAccess) return null;

  return (
    <>
      <div className="grid items-start gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha temporária *</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar senha *</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Senha temporária padrão: {DEFAULT_MEMBER_PASSWORD}. No primeiro login o
        responsável será obrigado a definir uma nova senha.
      </p>
    </>
  );
}
