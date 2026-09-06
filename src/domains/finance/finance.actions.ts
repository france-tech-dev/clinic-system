"use server";

import { requirePermission } from "@/server/auth/permissions";
import { requireOrgFeatureWrite } from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import { requireOrgId } from "@/shared/lib/org-context";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import { parseCashPeriodParams } from "./_lib/period-utils";
import {
  cashTransactionFormSchema,
  cashTransactionIdSchema,
  updateCashTransactionSchema,
} from "./finance.schema";
import {
  createCashTransaction,
  deleteCashTransaction,
  getCashflowPageData,
  markCashTransactionPosted,
  updateCashTransaction,
} from "./finance.service";
import type { CashTransactionDTO, CashflowPageData } from "./finance.types";

const FALLBACK =
  "Não foi possível concluir a operação no caixa. Tente novamente.";

function revalidateCashflow() {
  revalidatePath(paths.caixa);
  revalidatePath(paths.dashboard);
}

export async function getCashflowPageDataAction(
  input?: unknown,
): Promise<ActionResult<CashflowPageData>> {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId } = await requireOrgId();
    const period =
      input && typeof input === "object"
        ? parseCashPeriodParams(input as Record<string, string | undefined>)
        : parseCashPeriodParams({});
    return ok(await getCashflowPageData(organizationId, period));
  } catch (error) {
    return AppError.result(error, FALLBACK);
  }
}

export async function createCashTransactionAction(
  input: unknown,
): Promise<ActionResult<CashTransactionDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const payload = AppError.parse(cashTransactionFormSchema, input);
    const { organizationId } = await requireOrgFeatureWrite("caixa");

    const data = await createCashTransaction(organizationId, payload);
    revalidateCashflow();
    return ok(data);
  } catch (error) {
    return AppError.result(error, FALLBACK);
  }
}

export async function updateCashTransactionAction(
  input: unknown,
): Promise<ActionResult<CashTransactionDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(updateCashTransactionSchema, input);
    const { organizationId } = await requireOrgFeatureWrite("caixa");

    const data = await updateCashTransaction(organizationId, payload);
    if (!data) throw new AppError("Lançamento não encontrado");
    revalidateCashflow();
    return ok(data);
  } catch (error) {
    return AppError.result(error, FALLBACK);
  }
}

export async function markCashTransactionPostedAction(
  input: unknown,
): Promise<ActionResult<CashTransactionDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const { id } = AppError.parse(cashTransactionIdSchema, input);
    const { organizationId } = await requireOrgFeatureWrite("caixa");

    const data = await markCashTransactionPosted(organizationId, id);
    if (!data) throw new AppError("Lançamento não encontrado");
    revalidateCashflow();
    return ok(data);
  } catch (error) {
    return AppError.result(error, FALLBACK);
  }
}

export async function deleteCashTransactionAction(
  input: unknown,
): Promise<ActionResult<CashTransactionDTO>> {
  try {
    await requirePermission({ project: ["delete"] });
    const { id } = AppError.parse(cashTransactionIdSchema, input);
    const { organizationId } = await requireOrgFeatureWrite("caixa");

    const data = await deleteCashTransaction(organizationId, id);
    if (!data) throw new AppError("Lançamento não encontrado");
    revalidateCashflow();
    return ok(data);
  } catch (error) {
    return AppError.result(error, FALLBACK);
  }
}
