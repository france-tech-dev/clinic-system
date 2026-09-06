import {
  fail,
  type ActionResult,
  type FieldErrors,
} from "@/shared/types/action-result";
import { Prisma } from "@prisma/client";
import type { ZodError, ZodType } from "zod";

/**
 * Erro de aplicação (negócio / validação / infra sanitizada).
 *
 * Services: `throw new AppError("…")`
 * Actions:  `const data = AppError.parse(schema, input)` + `AppError.result(error)`
 */
export class AppError extends Error {
  readonly fieldErrors?: FieldErrors;

  constructor(
    message: string,
    options?: { fieldErrors?: FieldErrors; cause?: unknown },
  ) {
    super(
      message,
      options?.cause !== undefined ? { cause: options.cause } : undefined,
    );
    this.name = "AppError";
    this.fieldErrors = options?.fieldErrors;
  }

  result(): ActionResult<never> {
    return fail(this.message, this.fieldErrors);
  }

  static zod(error: ZodError, fallback = "Dados inválidos"): AppError {
    return new AppError(firstZodMessage(error, fallback), {
      fieldErrors: zodFieldErrors(error),
    });
  }

  static parse<T>(schema: ZodType<T>, input: unknown): T {
    const parsed = schema.safeParse(input);
    if (!parsed.success) throw AppError.zod(parsed.error);
    return parsed.data;
  }

  static result(
    error: unknown,
    fallback = "Algo deu errado. Tente novamente.",
  ): ActionResult<never> {
    if (error instanceof AppError) return error.result();

    if (isPrismaClientError(error) || isPrismaDumpMessage(error)) {
      console.error(error);
      return fail(fallback);
    }

    if (error instanceof Error) {
      return fail(error.message);
    }

    console.error(error);
    return fail(fallback);
  }
}

function zodFieldErrors(error: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key] = issue.message;
    }
  }
  return out;
}

function firstZodMessage(error: ZodError, fallback: string): string {
  return error.issues[0]?.message ?? fallback;
}

function isPrismaClientError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientInitializationError
  );
}

function isPrismaDumpMessage(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message;
  return (
    message.includes("Invalid `prisma.") ||
    message.includes("Unknown argument") ||
    message.includes("\nInvocation:") ||
    message.includes("Available options are marked")
  );
}
