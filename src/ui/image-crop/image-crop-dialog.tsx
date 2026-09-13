"use client";

import { useCallback, useState, useTransition } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { cropImageToFile } from "./crop-image";
import {
  getImageCropAspectValue,
  IMAGE_CROP_ASPECT_OPTIONS,
  type ImageCropAspectId,
} from "./types";

export type ImageCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (file: File) => void;
  title?: string;
  description?: string;
  defaultAspect?: ImageCropAspectId;
  outputFileName?: string;
};

type ImageCropDialogBodyProps = {
  imageSrc: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (file: File) => void;
  title: string;
  description: string;
  defaultAspect: ImageCropAspectId;
  outputFileName: string;
};

function ImageCropDialogBody({
  imageSrc,
  onOpenChange,
  onConfirm,
  title,
  description,
  defaultAspect,
  outputFileName,
}: ImageCropDialogBodyProps) {
  const [aspectId, setAspectId] = useState<ImageCropAspectId>(defaultAspect);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  function handleConfirm() {
    if (!croppedAreaPixels) {
      toast.error("Ajusta a área da foto antes de continuar.");
      return;
    }

    startTransition(async () => {
      try {
        const file = await cropImageToFile(
          imageSrc,
          croppedAreaPixels,
          outputFileName,
        );
        onConfirm(file);
        onOpenChange(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível ajustar a foto.",
        );
      }
    });
  }

  return (
    <DialogContent className="sm:max-w-lg" showCloseButton={!pending}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <div className="relative h-[min(50dvh,20rem)] w-full overflow-hidden rounded-lg bg-muted">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={getImageCropAspectValue(aspectId)}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          objectFit="contain"
        />
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Proporção</Label>
          <ToggleGroup
            type="single"
            value={aspectId}
            onValueChange={(value) => {
              if (!value) return;
              setAspectId(value as ImageCropAspectId);
            }}
            variant="outline"
            size="sm"
            className="flex flex-wrap justify-start"
          >
            {IMAGE_CROP_ASPECT_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.id}
                value={option.id}
                aria-label={`Proporção ${option.label}`}
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="image-crop-zoom">Zoom</Label>
          <Slider
            id="image-crop-zoom"
            min={1}
            max={3}
            step={0.05}
            value={[zoom]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              if (typeof next === "number") setZoom(next);
            }}
            disabled={pending}
            aria-label="Zoom da imagem"
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => onOpenChange(false)}
        >
          Cancelar
        </Button>
        <Button type="button" disabled={pending} onClick={handleConfirm}>
          {pending ? <Spinner data-icon="inline-start" /> : null}
          Confirmar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function ImageCropDialog({
  open,
  imageSrc,
  onOpenChange,
  onConfirm,
  title = "Ajustar imagem",
  description = "Enquadra a área e confirma.",
  defaultAspect = "free",
  outputFileName = "crop.png",
}: ImageCropDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {imageSrc ? (
        <ImageCropDialogBody
          key={imageSrc}
          imageSrc={imageSrc}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
          title={title}
          description={description}
          defaultAspect={defaultAspect}
          outputFileName={outputFileName}
        />
      ) : null}
    </Dialog>
  );
}
