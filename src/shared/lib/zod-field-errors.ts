import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ZodError } from "zod";
import type { FieldErrors } from "@/shared/types/action-result";

/** Primeira mensagem por campo (path[0]) a partir de um ZodError. */
export function zodFieldErrors(error: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key] = issue.message;
    }
  }
  return out;
}

export function firstZodMessage(
  error: ZodError,
  fallback = "Dados inválidos",
): string {
  return error.issues[0]?.message ?? fallback;
}

/** Aplica `fieldErrors` de uma ActionResult no `setError` do react-hook-form. */
export function applyActionFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors?: FieldErrors,
) {
  if (!fieldErrors) return;
  for (const [name, message] of Object.entries(fieldErrors)) {
    setError(name as Path<T>, { type: "server", message });
  }
}
