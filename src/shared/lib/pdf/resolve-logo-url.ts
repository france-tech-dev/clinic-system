/** Converte caminho relativo da logo em URL absoluta (necessário para @react-pdf Image). */
export function resolveLogoUrl(logoUrl: string, origin?: string): string {
  const trimmed = logoUrl.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  if (!base) return trimmed;
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}
