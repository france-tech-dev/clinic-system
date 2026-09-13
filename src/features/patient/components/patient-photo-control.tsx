"use client";

import { useId, useRef, useState, useTransition } from "react";
import { IconCamera, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { ImageCropDialog } from "@/components/image-crop";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
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
  MEDIA_MAX_SOURCE_BYTES,
  mediaMaxBytesError,
} from "@/shared/lib/media/media.constants";
import { cn } from "@/shared/lib/utils";

export function PatientPhotoControl({
  patientId,
  name,
  photoUrl,
  disabled,
  className,
  onChanged,
}: {
  patientId: string;
  name: string;
  photoUrl: string | null;
  disabled?: boolean;
  className?: string;
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
    if (file.size > MEDIA_MAX_SOURCE_BYTES) {
      toast.error(mediaMaxBytesError(MEDIA_MAX_SOURCE_BYTES));
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
    <div className={cn("relative shrink-0", className)}>
      <button
        type="button"
        disabled={busy}
        className={cn(
          "relative rounded-full outline-none transition-opacity",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          busy ? "opacity-70" : "hover:opacity-90",
        )}
        aria-label={
          hasCustomPhoto ? `Alterar foto de ${name}` : `Adicionar foto de ${name}`
        }
        onClick={() => inputRef.current?.click()}
      >
        <Avatar className="size-40">
          {previewUrl ? <AvatarImage src={previewUrl} alt={name} /> : null}
          <AvatarFallback className="text-3xl">
            {initialsFromName(name)}
          </AvatarFallback>
        </Avatar>
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 z-10 inline-flex size-10 items-center justify-center rounded-full border-2 border-background bg-card text-foreground shadow-sm"
        >
          {pending ? (
            <Spinner className="size-4" />
          ) : (
            <IconCamera className="size-4" />
          )}
        </span>
      </button>

      {hasCustomPhoto ? (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="absolute -top-1 -right-1 size-9 rounded-full border-border bg-card shadow-sm"
          disabled={busy}
          aria-label={`Remover foto de ${name}`}
          onClick={removePhoto}
        >
          <IconTrash className="size-4" />
        </Button>
      ) : null}

      <input
        id={fileInputId}
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        tabIndex={-1}
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
        kind="avatar"
        title="Ajustar foto"
        description="Enquadra o rosto no quadrado e confirma."
        defaultAspect="1:1"
      />
    </div>
  );
}
