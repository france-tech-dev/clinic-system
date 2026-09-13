"use client";

import { useId, useRef, useState, useTransition } from "react";
import { IconCamera, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { ImageCropDialog } from "@/components/image-crop";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  removePatientPhotoAction,
  uploadPatientPhotoAction,
} from "@/domains/patient/patient.actions";
import type { PatientDTO } from "@/domains/patient/patient.types";
import { initialsFromName } from "@/shared/lib/initials-from-name";
import {
  isManagedUploadUrl,
  isMediaUploadMimeType,
  MEDIA_KIND,
} from "@/shared/lib/media/media.constants";

export function PatientPhotoControl({
  patientId,
  name,
  photoUrl,
  disabled,
  onChanged,
}: {
  patientId: string;
  name: string;
  photoUrl: string | null;
  disabled?: boolean;
  onChanged?: (patient: PatientDTO) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const [cacheKey, setCacheKey] = useState(0);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const hasCustomPhoto = isManagedUploadUrl(photoUrl, "patients");
  const previewUrl = photoUrl
    ? `${photoUrl}${photoUrl.includes("?") ? "&" : "?"}v=${cacheKey}`
    : null;
  const busy = disabled || pending;
  const maxMb = MEDIA_KIND.avatar.maxUploadBytes / (1024 * 1024);

  function clearCropSrc() {
    setCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function applyPatient(patient: PatientDTO) {
    setCacheKey(Date.now());
    onChanged?.(patient);
  }

  function uploadPhoto(file: File) {
    const formData = new FormData();
    formData.set("patientId", patientId);
    formData.set("photo", file);

    startTransition(async () => {
      const result = await uploadPatientPhotoAction(formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      applyPatient(result.data);
      toast.success("Foto atualizada");
    });
  }

  function openCropForFile(file: File) {
    if (!isMediaUploadMimeType(file.type)) {
      toast.error("Escolha uma imagem PNG, JPEG ou WebP");
      return;
    }
    if (file.size > MEDIA_KIND.avatar.maxUploadBytes) {
      toast.error(`A foto pode ter no máximo ${maxMb} MB`);
      return;
    }

    clearCropSrc();
    setCropSrc(URL.createObjectURL(file));
    setCropOpen(true);
  }

  function handleCropOpenChange(open: boolean) {
    setCropOpen(open);
    if (!open) clearCropSrc();
  }

  function removePhoto() {
    startTransition(async () => {
      const result = await removePatientPhotoAction({ id: patientId });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      applyPatient(result.data);
      toast.success("Foto removida");
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="relative">
        <Avatar size="lg" className="size-14">
          {previewUrl ? <AvatarImage src={previewUrl} alt={name} /> : null}
          <AvatarFallback>{initialsFromName(name)}</AvatarFallback>
        </Avatar>
        {pending ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
            <Spinner className="size-4" />
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <IconCamera data-icon="inline-start" />
          Foto
        </Button>
        {hasCustomPhoto ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={busy}
            onClick={removePhoto}
          >
            <IconTrash data-icon="inline-start" />
            Remover
          </Button>
        ) : null}
      </div>

      <input
        id={fileInputId}
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        aria-label={`Escolher foto de ${name}`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) openCropForFile(file);
        }}
      />

      <ImageCropDialog
        open={cropOpen}
        imageSrc={cropSrc}
        onOpenChange={handleCropOpenChange}
        onConfirm={uploadPhoto}
        title="Ajustar foto"
        description="Enquadra o rosto no quadrado e confirma."
        defaultAspect="1:1"
        outputFileName="patient-photo.png"
      />
    </div>
  );
}
