/** Abreviatura curta para chips / listas de convite. */
export function protocolAbbrev(protocolId: string): string {
  if (protocolId.startsWith("pedi")) return "PD";
  if (protocolId.startsWith("spm")) return "SP";
  if (protocolId.startsWith("perfil-sensorial")) return "PS";
  return protocolId.slice(0, 2).toUpperCase();
}

export function protocolSubtitle(
  protocolId: string,
  name: string,
): string | null {
  if (protocolId.includes("escola")) {
    if (protocolId.includes("5anos")) return "Escola · 5 anos";
    if (protocolId.includes("3anos")) return "Escola · 3 anos";
    if (protocolId.includes("2anos")) return "Escola · 2 anos";
  }
  if (protocolId.includes("casa")) {
    if (protocolId.includes("5anos")) return "Casa · 5 anos";
    if (protocolId.includes("3anos")) return "Casa · 3 anos";
    if (protocolId.includes("2anos")) return "Casa · 2 anos";
  }
  if (protocolId.includes("5anos")) return "5 anos";
  if (protocolId.includes("3anos")) return "3 anos";
  if (protocolId.includes("2anos")) return "2 anos";
  const match = name.match(/\(([^)]+)\)/);
  return match?.[1] ?? null;
}
