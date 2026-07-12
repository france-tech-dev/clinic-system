import "server-only";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import {
  isCustomOrganizationLogo,
  ORGANIZATION_LOGO_UPLOAD_DIR,
  organizationLogoMimeToExtension,
  type OrganizationLogoMimeType,
} from "./organization-logo";

export async function saveOrganizationLogoFile(
  organizationId: string,
  bytes: Buffer,
  mimeType: OrganizationLogoMimeType,
): Promise<string> {
  const ext = organizationLogoMimeToExtension(mimeType);
  const dir = path.join(
    process.cwd(),
    "public",
    ORGANIZATION_LOGO_UPLOAD_DIR,
    organizationId,
  );
  await mkdir(dir, { recursive: true });

  const filename = `logo${ext}`;
  await writeFile(path.join(dir, filename), bytes);

  return `/${ORGANIZATION_LOGO_UPLOAD_DIR}/${organizationId}/${filename}`;
}

export async function deleteOrganizationLogoFile(
  logoUrl: string,
): Promise<void> {
  if (!isCustomOrganizationLogo(logoUrl)) return;

  const relative = logoUrl.replace(/^\//, "");
  const absolute = path.join(process.cwd(), "public", relative);
  const uploadsRoot = path.join(
    process.cwd(),
    "public",
    ORGANIZATION_LOGO_UPLOAD_DIR,
  );

  if (!absolute.startsWith(uploadsRoot)) return;

  try {
    await unlink(absolute);
  } catch {
    // ficheiro já removido ou inexistente
  }
}
