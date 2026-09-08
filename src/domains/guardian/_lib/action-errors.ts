import { AppError } from "@/shared/lib/app-error";
import type { ActionResult, FieldErrors } from "@/shared/types/action-result";

function fieldErrorsFromMessage(message: string): FieldErrors | undefined {
  const lower = message.toLowerCase();
  if (lower.includes("cpf")) return { cpf: message };
  if (lower.includes("e-mail") || lower.includes("email")) {
    return { email: message };
  }
  if (lower.includes("senhas") || lower.includes("senha")) {
    return { confirmPassword: message };
  }
  return undefined;
}

/** Erros de negócio do guardian (CPF/e-mail/senha) → fieldErrors. */
export function handleGuardianActionError(error: unknown): ActionResult<never> {
  if (error instanceof Error && !(error instanceof AppError) && error.message) {
    return new AppError(error.message, {
      fieldErrors: fieldErrorsFromMessage(error.message),
    }).result();
  }
  return AppError.result(error);
}
