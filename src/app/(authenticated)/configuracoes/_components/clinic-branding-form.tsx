"use client";

import Image from "next/image";
import { useId, useRef, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPhoto, IconTrash, IconUpload } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  removeOrganizationLogoAction,
  saveOrganizationBrandingAction,
  uploadOrganizationLogoAction,
} from "@/domains/settings/settings.actions";
import {
  organizationBrandingSchema,
  type OrganizationBrandingInput,
} from "@/domains/settings/settings.schema";
import type { PrintBranding } from "@/domains/settings/settings.types";
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

export function ClinicBrandingForm({
  initial,
}: {
  initial: PrintBranding;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const [branding, setBranding] = useState(initial);
  const [logoVersion, setLogoVersion] = useState(0);
  const [savePending, startSaveTransition] = useTransition();
  const [logoPending, startLogoTransition] = useTransition();

  const form = useForm<OrganizationBrandingInput>({
    resolver: zodResolver(organizationBrandingSchema),
    defaultValues: { clinicName: initial.clinicName },
  });

  const clinicNameWatch =
    useWatch({ control: form.control, name: "clinicName" }) ?? "";
  const hasCustomLogo = isCustomOrganizationLogo(branding.logoUrl);
  const previewUrl = `${branding.logoUrl}?v=${logoVersion}`;
  const isDirty = form.formState.isDirty;

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
    <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">Cabeçalho dos PDF</h3>
        <p className="text-sm text-muted-foreground">
          Nome e logo no topo dos relatórios (prontuário, anamnese e avaliação).
        </p>
      </div>

      <div
        className="flex items-center gap-3 rounded-md border border-border bg-background p-3"
        aria-label="Pré-visualização do cabeçalho do PDF"
      >
        <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border">
          {branding.logoUrl ? (
            <Image
              src={previewUrl}
              alt=""
              fill
              className="object-contain p-1"
              unoptimized
            />
          ) : (
            <IconPhoto className="size-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {clinicNameWatch.trim() || "Nome da clínica"}
          </p>
          <p className="text-xs text-muted-foreground">
            Assim aparece no cabeçalho dos PDF
          </p>
        </div>
      </div>

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
            <label htmlFor={fileInputId} className="text-sm font-medium">
              Logo
            </label>
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
                  <IconPhoto className="size-6 text-muted-foreground" />
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
                      <IconUpload data-icon="inline-start" />
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
                        <IconTrash data-icon="inline-start" />
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
              id={fileInputId}
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              aria-label="Enviar logo da clínica"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) uploadLogo(file);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={savePending || !isDirty}>
              {savePending ? <Spinner data-icon="inline-start" /> : null}
              Salvar nome
            </Button>
            {isDirty ? (
              <p className="text-xs text-muted-foreground">
                Alterações por guardar
              </p>
            ) : null}
          </div>
        </form>
      </Form>
    </div>
  );
}
