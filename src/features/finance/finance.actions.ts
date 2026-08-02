"use server";

import { revalidatePath } from "next/cache";
import { paths } from "@/shared/constants/paths";
import { requirePermission } from "@/server/auth/permissions";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import {
  cashTransactionFormSchema,
  cashTransactionIdSchema,
  updateCashTransactionSchema,
} from "./finance.schema";
import {
  createCashTransaction,
  deleteCashTransaction,
  getCashflowPageData,
  updateCashTransaction,
} from "./finance.service";
import type { CashTransactionDTO, CashflowPageData } from "./finance.types";

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  if (error instanceof Error) return fail(error.message);
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

function revalidateCashflow() {
  revalidatePath(paths.caixa);
}

export async function getCashflowPageDataAction(
  month?: string,
): Promise<ActionResult<CashflowPageData>> {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId } = await requireOrgId();
    return ok(await getCashflowPageData(organizationId, month));
  } catch (error) {
    return handleError(error);
  }
}

export async function createCashTransactionAction(
  input: unknown,
): Promise<ActionResult<CashTransactionDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const parsed = cashTransactionFormSchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);
    const { organizationId } = await requireOrgId();
    const data = await createCashTransaction(organizationId, parsed.data);
    revalidateCashflow();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateCashTransactionAction(
  input: unknown,
): Promise<ActionResult<CashTransactionDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const parsed = updateCashTransactionSchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);
    const { organizationId } = await requireOrgId();
    const data = await updateCashTransaction(organizationId, parsed.data);
    if (!data) return fail("Lançamento não encontrado");
    revalidateCashflow();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteCashTransactionAction(
  input: unknown,
): Promise<ActionResult<CashTransactionDTO>> {
  try {
    await requirePermission({ project: ["delete"] });
    const parsed = cashTransactionIdSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId } = await requireOrgId();
    const data = await deleteCashTransaction(organizationId, parsed.data.id);
    if (!data) return fail("Lançamento não encontrado");
    revalidateCashflow();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
