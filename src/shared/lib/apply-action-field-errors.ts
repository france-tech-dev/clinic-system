import type { FieldErrors } from "@/shared/types/action-result";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

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
