/**
 * Actualiza path + query no browser sem navegação Next.js
 * (não dispara RSC / proxy / refetch do Server Component).
 */
export function replacePathAndQuery(pathWithQuery: string) {
  if (typeof window === "undefined") return;
  window.history.replaceState(window.history.state, "", pathWithQuery);
}
