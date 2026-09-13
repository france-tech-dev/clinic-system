export type ImageCropAspectId = "free" | "1:1" | "4:3" | "16:9";

export type ImageCropAspectOption = {
  id: ImageCropAspectId;
  label: string;
  /** `undefined` = área livre (sem proporção fixa). */
  value: number | undefined;
};

export const IMAGE_CROP_ASPECT_OPTIONS: ImageCropAspectOption[] = [
  { id: "free", label: "Livre", value: undefined },
  { id: "1:1", label: "1:1", value: 1 },
  { id: "4:3", label: "4:3", value: 4 / 3 },
  { id: "16:9", label: "16:9", value: 16 / 9 },
];

export function getImageCropAspectValue(
  id: ImageCropAspectId,
): number | undefined {
  return IMAGE_CROP_ASPECT_OPTIONS.find((option) => option.id === id)?.value;
}
