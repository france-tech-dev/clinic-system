"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  removeOrganizationLogoAction,
  saveOrganizationBrandingAction,
  uploadOrganizationLogoAction,
} from "@/features/settings/settings.actions";
import {
  organizationBrandingSchema,
  type OrganizationBrandingInput,
} from "@/features/settings/settings.schema";
import type { PrintBranding } from "@/features/settings/settings.types";
import { DEFAULT_PRINT_LOGO } from "@/shared/constants/brand";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";
import { isCustomOrganizationLogo } from "@/shared/lib/organization-logo";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ClinicBrandingForm({
  initial,
}: {
  initial: PrintBranding;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [branding, setBranding] = useState(initial);
  const [logoVersion, setLogoVersion] = useState(0);
  const [savePending, startSaveTransition] = useTransition();
  const [logoPending, startLogoTransition] = useTransition();

  const form = useForm<OrganizationBrandingInput>({
    resolver: zodResolver(organizationBrandingSchema),
    defaultValues: { clinicName: initial.clinicName },
  });

  const hasCustomLogo = isCustomOrganizationLogo(branding.logoUrl);
  const previewUrl = `${branding.logoUrl}?v=${logoVersion}`;

  function onSubmit(data: OrganizationBrandingInput) {
    startSaveTransition(async () => {
      const result = await saveOrganizationBrandingAction(data);
      if (!result.success) {
        applyActionFieldErrors(form.setError, result.fieldErrors);
        toast.error(result.message);
        return;
      }
      setBranding(result.data);
      form.reset({ clinicName: result.data.clinicName });
      toast.success("Nome da clínica salvo");
    });
  }

  function uploadLogo(file: File) {
    const formData = new FormData();
    formData.set("logo", file);

    startLogoTransition(async () => {
      const result = await uploadOrganizationLogoAction(formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setBranding(result.data);
      setLogoVersion(Date.now());
      toast.success("Logo atualizada");
    });
  }

  function removeLogo() {
    startLogoTransition(async () => {
      const result = await removeOrganizationLogoAction();
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setBranding(result.data);
      setLogoVersion(Date.now());
      toast.success("Logo removida");
    });
  }

  return (
    <div className="max-w-lg space-y-4 rounded-md border border-border bg-card p-4">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Identidade da clínica
      </p>
      <p className="text-sm text-muted-foreground">
        Aparece no cabeçalho dos relatórios PDF (prontuário, anamnese e
        avaliação).
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4"
        >
          <FormField
            control={form.control}
            name="clinicName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da clínica *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome exibido nos relatórios"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4 rounded-md border border-border bg-muted/20 p-3">
              <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background">
                {branding.logoUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Logo da clínica"
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                ) : (
                  <ImageIcon className="size-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-xs text-muted-foreground">
                  PNG, JPEG ou WebP · máx. 2 MB
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={logoPending}
                    onClick={() => inputRef.current?.click()}
                  >
                    {logoPending ? (
                      <Spinner data-icon="inline-start" />
                    ) : (
                      <Upload data-icon="inline-start" />
                    )}
                    Enviar logo
                  </Button>
                  {hasCustomLogo ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={logoPending}
                      onClick={removeLogo}
                    >
                      {logoPending ? (
                        <Spinner data-icon="inline-start" />
                      ) : (
                        <Trash2 data-icon="inline-start" />
                      )}
                      Remover
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
            {!hasCustomLogo ? (
              <p className="text-xs text-muted-foreground">
                Usando logo padrão ({DEFAULT_PRINT_LOGO}). Envie uma imagem para
                personalizar.
              </p>
            ) : null}
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) uploadLogo(file);
              }}
            />
          </div>

          <Button type="submit" disabled={savePending}>
            {savePending ? <Spinner data-icon="inline-start" /> : null}
            Salvar nome
          </Button>
        </form>
      </Form>
    </div>
  );
}
