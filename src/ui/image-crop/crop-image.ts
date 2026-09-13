import type { Area } from "react-easy-crop";

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

export async function cropImageToFile(
  imageSrc: string,
  pixelCrop: Area,
  fileName = "crop.png",
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas não suportado neste browser.");
  }

  const width = Math.max(1, Math.round(pixelCrop.width));
  const height = Math.max(1, Math.round(pixelCrop.height));
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
      "image/png",
      1,
    );
  });

  return new File([blob], fileName, { type: "image/png" });
}
