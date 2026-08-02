"use server";

import { revalidatePath } from "next/cache";
import { paths } from "@/shared/constants/paths";
import type { AppointmentStatusId } from "@/shared/constants/appointment";
import { requirePermission } from "@/server/auth/permissions";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import {
  appointmentFormSchema,
  appointmentIdSchema,
  appointmentStatusSchema,
  rescheduleAppointmentSchema,
  updateAppointmentSchema,
} from "./schedule.schema";
import {
  createAppointments,
  deleteAppointment,
  getAgendaPageData,
  getCurrentMemberId,
  rescheduleAppointment,
  setAppointmentStatus,
  updateAppointment,
} from "./schedule.service";
import type { AppointmentDTO } from "./schedule.types";

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  if (error instanceof Error) return fail(error.message);
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

function revalidateAgenda() {
  revalidatePath(paths.agenda);
  revalidatePath(paths.painel);
}

export async function getAgendaDataAction(
  selectedDate: string,
  today: string,
): Promise<
  ActionResult<{ dayAppointments: AppointmentDTO[]; upcoming: AppointmentDTO[] }>
> {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId } = await requireOrgId();
    return ok(await getAgendaPageData(organizationId, selectedDate, today));
  } catch (error) {
    return handleError(error);
  }
}

export async function createAppointmentAction(
  input: unknown,
): Promise<ActionResult<AppointmentDTO[]>> {
  try {
    await requirePermission({ project: ["create"] });
    const parsed = appointmentFormSchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);
    const { organizationId, userId } = await requireOrgId();
    const memberId =
      parsed.data.memberId ||
      (await getCurrentMemberId(organizationId, userId));
    if (!memberId) {
      return fail("Profissional não encontrado na organização");
    }
    const data = await createAppointments(organizationId, {
      ...parsed.data,
      memberId,
    });
    if (data === "patient_not_found") return fail("Paciente não encontrado");
    if (data === "member_not_found") {
      return fail("Profissional inválido para esta organização");
    }
    revalidateAgenda();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateAppointmentAction(
  input: unknown,
): Promise<ActionResult<AppointmentDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const parsed = updateAppointmentSchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);
    const { organizationId } = await requireOrgId();
    const data = await updateAppointment(organizationId, {
      ...parsed.data,
      status: parsed.data.status as AppointmentStatusId,
    });
    if (data === "member_not_found") {
      return fail("Profissional inválido para esta organização");
    }
    if (data === "not_found" || !data) {
      return fail("Agendamento não encontrado");
    }
    revalidateAgenda();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function rescheduleAppointmentAction(
  input: unknown,
): Promise<ActionResult<AppointmentDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const parsed = rescheduleAppointmentSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId } = await requireOrgId();
    const result = await rescheduleAppointment(
      organizationId,
      parsed.data.id,
      parsed.data.date,
      parsed.data.time,
    );
    if (result === "not_found") return fail("Agendamento não encontrado");
    if (result === "invalid_status") {
      return fail("Só é possível realocar agendamentos com status Agendado");
    }
    revalidateAgenda();
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function setAppointmentStatusAction(
  input: unknown,
): Promise<ActionResult<AppointmentDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const parsed = appointmentStatusSchema.safeParse(input);
    if (!parsed.success) return fail("Dados inválidos");
    const { organizationId } = await requireOrgId();
    const data = await setAppointmentStatus(
      organizationId,
      parsed.data.id,
      parsed.data.status as AppointmentStatusId,
    );
    if (!data) return fail("Agendamento não encontrado");
    revalidateAgenda();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteAppointmentAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requirePermission({ project: ["delete"] });
    const parsed = appointmentIdSchema.safeParse(input);
    if (!parsed.success) return fail("ID inválido");
    const { organizationId } = await requireOrgId();
    const removed = await deleteAppointment(organizationId, parsed.data.id);
    if (!removed) return fail("Agendamento não encontrado");
    revalidateAgenda();
    return ok({ id: removed.id });
  } catch (error) {
    return handleError(error);
  }
}
