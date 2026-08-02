export type FieldErrors = Record<string, string>;

export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string; fieldErrors?: FieldErrors };

export function ok<T>(data: T, message?: string): ActionResult<T> {
  return message !== undefined
    ? { success: true, data, message }
    : { success: true, data };
}

export function fail(
  message: string,
  fieldErrors?: FieldErrors,
): ActionResult<never> {
  return fieldErrors
    ? { success: false, message, fieldErrors }
    : { success: false, message };
}
