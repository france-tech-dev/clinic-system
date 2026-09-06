"use server";

import { requirePermission } from "@/server/auth/permissions";
import { requireOrgWrite } from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import { requireOrgId } from "@/shared/lib/org-context";
import { ok, type ActionResult } from "@/shared/types/action-result";
import type { AppointmentStatus } from "@prisma/enums";
import { revalidatePath } from "next/cache";
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

function revalidateAgenda() {
  revalidatePath(paths.agenda);
  revalidatePath(paths.dashboard);
}

export async function getAgendaDataAction(
  selectedDate: string,
  today: string,
): Promise<
  ActionResult<{
    dayAppointments: AppointmentDTO[];
    upcoming: AppointmentDTO[];
  }>
> {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId } = await requireOrgId();
    return ok(await getAgendaPageData(organizationId, selectedDate, today));
  } catch (error) {
    return AppError.result(error);
  }
}

export async function createAppointmentAction(
  input: unknown,
): Promise<ActionResult<AppointmentDTO[]>> {
  try {
    await requirePermission({ project: ["create"] });
    const payload = AppError.parse(appointmentFormSchema, input);
    const { organizationId, userId } = await requireOrgWrite();
    const memberId =
      payload.memberId || (await getCurrentMemberId(organizationId, userId));
    if (!memberId) {
      throw new AppError("Profissional não encontrado na organização");
    }
    const data = await createAppointments(organizationId, {
      ...payload,
      memberId,
    });
    if (data === "patient_not_found") {
      throw new AppError("Paciente não encontrado");
    }
    if (data === "member_not_found") {
      throw new AppError("Profissional inválido para esta organização");
    }
    revalidateAgenda();
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function updateAppointmentAction(
  input: unknown,
): Promise<ActionResult<AppointmentDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(updateAppointmentSchema, input);
    const { organizationId } = await requireOrgWrite();
    const data = await updateAppointment(organizationId, {
      ...payload,
      status: payload.status as AppointmentStatus,
    });
    if (data === "member_not_found") {
      throw new AppError("Profissional inválido para esta organização");
    }
    if (data === "not_found" || !data) {
      throw new AppError("Agendamento não encontrado");
    }
    revalidateAgenda();
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function rescheduleAppointmentAction(
  input: unknown,
): Promise<ActionResult<AppointmentDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(rescheduleAppointmentSchema, input);
    const { organizationId } = await requireOrgWrite();
    const result = await rescheduleAppointment(
      organizationId,
      payload.id,
      payload.date,
      payload.time,
    );
    if (result === "not_found") {
      throw new AppError("Agendamento não encontrado");
    }
    if (result === "invalid_status") {
      throw new AppError(
        "Só é possível realocar agendamentos com status Agendado",
      );
    }
    revalidateAgenda();
    return ok(result);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function setAppointmentStatusAction(
  input: unknown,
): Promise<ActionResult<AppointmentDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(appointmentStatusSchema, input);
    const { organizationId } = await requireOrgWrite();
    const data = await setAppointmentStatus(
      organizationId,
      payload.id,
      payload.status as AppointmentStatus,
    );
    if (!data) throw new AppError("Agendamento não encontrado");
    revalidateAgenda();
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function deleteAppointmentAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requirePermission({ project: ["delete"] });
    const { id } = AppError.parse(appointmentIdSchema, input);
    const { organizationId } = await requireOrgWrite();
    const removed = await deleteAppointment(organizationId, id);
    if (!removed) throw new AppError("Agendamento não encontrado");
    revalidateAgenda();
    return ok({ id: removed.id });
  } catch (error) {
    return AppError.result(error);
  }
}
