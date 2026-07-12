"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  removeOrganizationLogoAction,
  saveOrganizationBrandingAction,
  uploadOrganizationLogoAction,
} from "@/features/settings/settings.actions";
import type { PrintBranding } from "@/features/settings/settings.types";
import { DEFAULT_PRINT_LOGO } from "@/shared/constants/brand";
import { isCustomOrganizationLogo } from "@/shared/lib/organization-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ClinicBrandingForm({
  initial,
}: {
  initial: PrintBranding;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [branding, setBranding] = useState(initial);
  const [clinicName, setClinicName] = useState(initial.clinicName);
  const [logoVersion, setLogoVersion] = useState(0);
  const [savePending, startSaveTransition] = useTransition();
  const [logoPending, startLogoTransition] = useTransition();

  const hasCustomLogo = isCustomOrganizationLogo(branding.logoUrl);
  const previewUrl = `${branding.logoUrl}?v=${logoVersion}`;

  function saveClinicName() {
    startSaveTransition(async () => {
      const result = await saveOrganizationBrandingAction({ clinicName });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setBranding(result.data);
      setClinicName(result.data.clinicName);
      toast.success("Nome da clínica salvo");
    });
  }

  function uploadLogo(file: File) {
    const formData = new FormData();
    formData.set("logo", file);

    startLogoTransition(async () => {
      const result = await uploadOrganizationLogoAction(formData);
      if (!result.success) {
        toast.error(result.error);
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
        toast.error(result.error);
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
        Aparece no cabeçalho dos relatórios PDF (prontuário, anamnese, avaliação
        e roteiro).
      </p>

      <div className="grid gap-1.5">
        <Label htmlFor="clinic-name">Nome da clínica</Label>
        <Input
          id="clinic-name"
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          placeholder="Nome exibido nos relatórios"
        />
      </div>

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
                <Upload className="size-4" />
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
                  <Trash2 className="size-4" />
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

      <Button disabled={savePending} onClick={saveClinicName}>
        Salvar nome
      </Button>
    </div>
  );
}
