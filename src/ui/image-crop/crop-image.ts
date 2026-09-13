import { MEDIA_KIND, type MediaKind } from "@/shared/lib/media/media.constants";
import type { Area } from "react-easy-crop";

const JPEG_QUALITY = 0.88;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () =>
      reject(new Error("Não foi possível carregar a imagem.")),
    );
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

/** Recorta e redimensiona no cliente (JPEG) antes do upload. */
export async function cropImageToFile(
  imageSrc: string,
  pixelCrop: Area,
  kind: MediaKind,
): Promise<File> {
  const spec = MEDIA_KIND[kind];
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas não suportado neste browser.");
  }

  const cropWidth = Math.max(1, Math.round(pixelCrop.width));
  const cropHeight = Math.max(1, Math.round(pixelCrop.height));

  let width: number;
  let height: number;
  if (spec.square) {
    width = height = spec.sizePx;
  } else {
    const scale = Math.min(1, spec.sizePx / Math.max(cropWidth, cropHeight));
    width = Math.max(1, Math.round(cropWidth * scale));
    height = Math.max(1, Math.round(cropHeight * scale));
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Falha ao gerar a imagem recortada."));
          return;
        }
        resolve(result);
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });

  const fileName = kind === "logo" ? "logo.jpg" : "photo.jpg";
  return new File([blob], fileName, { type: "image/jpeg" });
}
