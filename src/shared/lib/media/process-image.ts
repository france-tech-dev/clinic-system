import "server-only";
import sharp from "sharp";
import {
  MEDIA_KIND,
  MEDIA_OUTPUT_MIME,
  type MediaKind,
} from "./media.constants";

export type ProcessedImage = {
  bytes: Buffer;
  contentType: typeof MEDIA_OUTPUT_MIME;
};

/**
 * Normaliza upload → WebP nas dimensões da política (avatar 256², logo ≤1024).
 */
export async function processImageToWebp(
  input: Buffer,
  kind: MediaKind,
): Promise<ProcessedImage> {
  const spec = MEDIA_KIND[kind];
  const base = sharp(input, { failOn: "none" }).rotate();

  const resized = spec.square
    ? base.resize(spec.sizePx, spec.sizePx, {
        fit: "cover",
        position: "centre",
      })
    : base.resize({
        width: spec.sizePx,
        height: spec.sizePx,
        fit: "inside",
        withoutEnlargement: true,
      });

  const bytes = await resized.webp({ quality: spec.webpQuality }).toBuffer();
  return { bytes, contentType: MEDIA_OUTPUT_MIME };
}
