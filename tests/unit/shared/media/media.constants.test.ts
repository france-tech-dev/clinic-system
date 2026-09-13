import {
  isManagedUploadUrl,
  isMediaUploadMimeType,
  MEDIA_MAX_SOURCE_BYTES,
  MEDIA_MAX_UPLOAD_BYTES,
  mediaMaxBytesError,
  organizationLogoKey,
  patientPhotoKey,
  userAvatarKey,
} from "@/shared/lib/media/media.constants";
import { describe, expect, it } from "vitest";

describe("isMediaUploadMimeType", () => {
  it("aceita png, jpeg e webp", () => {
    expect(isMediaUploadMimeType("image/png")).toBe(true);
    expect(isMediaUploadMimeType("image/jpeg")).toBe(true);
    expect(isMediaUploadMimeType("image/webp")).toBe(true);
  });

  it("rejeita outros mime types", () => {
    expect(isMediaUploadMimeType("image/gif")).toBe(false);
    expect(isMediaUploadMimeType("application/pdf")).toBe(false);
  });
});

describe("isManagedUploadUrl", () => {
  it("reconhece URLs geridas por scope", () => {
    expect(
      isManagedUploadUrl(
        "https://r2.example/uploads/patients/p1.webp",
        "patients",
      ),
    ).toBe(true);
    expect(isManagedUploadUrl("/uploads/avatars/u1.webp", "avatars")).toBe(
      true,
    );
    expect(
      isManagedUploadUrl(
        "https://r2.example/uploads/organizations/o1/logo.webp",
        "organizations",
      ),
    ).toBe(true);
  });

  it("rejeita null, default brand e outro scope", () => {
    expect(isManagedUploadUrl(null, "patients")).toBe(false);
    expect(isManagedUploadUrl("/brand/logo.svg", "organizations")).toBe(false);
    expect(isManagedUploadUrl("/uploads/avatars/u1.webp", "patients")).toBe(
      false,
    );
  });
});

describe("media keys", () => {
  it("gera keys webp estáveis", () => {
    expect(organizationLogoKey("org-1")).toBe(
      "uploads/organizations/org-1/logo.webp",
    );
    expect(userAvatarKey("user-1")).toBe("uploads/avatars/user-1.webp");
    expect(patientPhotoKey("patient-1")).toBe(
      "uploads/patients/patient-1.webp",
    );
  });
});

describe("limites e mensagem", () => {
  it("mantém source > upload (picker vs action)", () => {
    expect(MEDIA_MAX_SOURCE_BYTES).toBeGreaterThan(MEDIA_MAX_UPLOAD_BYTES);
    expect(MEDIA_MAX_UPLOAD_BYTES).toBe(1 * 1024 * 1024);
  });

  it("formata erro de tamanho em MB", () => {
    expect(mediaMaxBytesError(MEDIA_MAX_UPLOAD_BYTES)).toBe(
      "A imagem deve ter no máximo 1 MB",
    );
  });
});
