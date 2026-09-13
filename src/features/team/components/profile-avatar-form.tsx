"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconTrash, IconUpload, IconUser } from "@tabler/icons-react";
import { toast } from "sonner";
import { ImageCropDialog } from "@/components/image-crop";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  removeOwnAvatarAction,
  uploadOwnAvatarAction,
} from "@/domains/team/team.actions";
import type { TeamMemberDTO } from "@/domains/team/team.types";
import { initialsFromName } from "@/shared/lib/initials-from-name";
import {
  isManagedUploadUrl,
  isMediaUploadMimeType,
  MEDIA_KIND,
} from "@/shared/lib/media/media.constants";

export function ProfileAvatarForm({
  imageUrl,
  name,
  onChanged,
}: {
  imageUrl: string | null;
  name: string;
  onChanged?: (member: TeamMemberDTO) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const [cacheKey, setCacheKey] = useState(0);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const hasCustomAvatar = isManagedUploadUrl(imageUrl, "avatars");
  const previewUrl = imageUrl
    ? `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}v=${cacheKey}`
    : null;
  const maxMb = MEDIA_KIND.avatar.maxUploadBytes / (1024 * 1024);

  function clearCropSrc() {
    setCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function applyMember(member: TeamMemberDTO) {
    setCacheKey(Date.now());
    onChanged?.(member);
    router.refresh();
  }

  function uploadAvatar(file: File) {
    const formData = new FormData();
    formData.set("avatar", file);

    startTransition(async () => {
      const result = await uploadOwnAvatarAction(formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      applyMember(result.data);
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

  function removeAvatar() {
    startTransition(async () => {
      const result = await removeOwnAvatarAction();
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      applyMember(result.data);
      toast.success("Foto removida");
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">Sua foto</h2>
        <p className="text-sm text-muted-foreground">
          Assim a equipa te reconhece na clínica.
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-md border border-border bg-muted/20 p-3">
        <Avatar size="lg" className="size-16">
          {previewUrl ? <AvatarImage src={previewUrl} alt={name} /> : null}
          <AvatarFallback>
            {name.trim() ? initialsFromName(name) : <IconUser />}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            JPG ou PNG · até {maxMb} MB
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
            >
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <IconUpload data-icon="inline-start" />
              )}
              Escolher foto
            </Button>
            {hasCustomAvatar ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={removeAvatar}
              >
                {pending ? (
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

      <input
        id={fileInputId}
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        aria-label="Escolher foto de perfil"
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
        onConfirm={uploadAvatar}
        title="Ajustar foto"
        description="Enquadra o rosto no quadrado e confirma."
        defaultAspect="1:1"
        outputFileName="user-avatar.png"
      />
    </div>
  );
}
