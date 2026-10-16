import { toGuardianDTO } from "@/domains/guardian/_lib/mappers";
import { guardianRepository } from "@/domains/guardian/guardian.repository";
import type { CreateGuardianInput, UpdateGuardianInput } from "@/domains/guardian/guardian.schema";
import { enableGuardianPortalAccess, updateGuardian } from "@/domains/guardian/guardian.service";
import type { CreatedGuardianDTO, GuardianDTO } from "@/domains/guardian/guardian.types";
import { toPatientDTO } from "@/domains/patient/_lib/mappers";
import { patientRepository } from "@/domains/patient/patient.repository";
import type { PatientFormInput, UpdatePatientInput } from "@/domains/patient/patient.schema";
import { updatePatient } from "@/domains/patient/patient.service";
import type { PatientDTO } from "@/domains/patient/patient.types";

async function assertCpfAvailable(
  organizationId: string,
  cpf: string | null | undefined,
  excludeId?: string,
) {
  if (!cpf) return;
  const duplicate = await guardianRepository.findByCpf(organizationId, cpf, excludeId);
  if (duplicate) {
    throw new Error("Já existe um responsável com este CPF nesta clínica.");
  }
}

function toGuardianForm(input: CreateGuardianInput | Omit<UpdateGuardianInput, "id">) {
  return {
    name: input.name,
    phone: input.phone,
    email: input.email,
    cpf: input.cpf,
    address: input.address,
    zipCode: input.zipCode,
    documentImageUrl: input.documentImageUrl,
    insurance: input.insurance,
    motherName: input.motherName,
    motherCpf: input.motherCpf,
    fatherName: input.fatherName,
    fatherCpf: input.fatherCpf,
  };
}

/**
 * Cria responsável + paciente (tx encapsulada no repository).
 * Portal (auth.api) fica fora do tx; compensação de user órfão em provisionPortalAccess.
 */
export async function createPatientWithGuardianRecord(
  organizationId: string,
  guardianInput: CreateGuardianInput,
  patientInput: Omit<PatientFormInput, "guardianId"> & { memberIds?: string[] },
): Promise<{ patient: PatientDTO; guardian: CreatedGuardianDTO }> {
  await assertCpfAvailable(organizationId, guardianInput.cpf);

  const { guardianRow, patientRow } = await patientRepository.createWithNewGuardian(
    organizationId,
    toGuardianForm(guardianInput),
    patientInput,
  );

  if (guardianInput.enablePortalAccess) {
    if (!guardianInput.email) {
      throw new Error("E-mail é obrigatório para acesso ao portal");
    }
    const guardian = await enableGuardianPortalAccess(organizationId, {
      id: guardianRow.id,
      password: guardianInput.password,
      confirmPassword: guardianInput.confirmPassword,
    });
    return { patient: toPatientDTO(patientRow), guardian };
  }

  return {
    patient: toPatientDTO(patientRow),
    guardian: { ...toGuardianDTO(guardianRow), mustChangePassword: false },
  };
}

/** Actualiza responsável + paciente em sequência (sem tx). */
export async function updatePatientWithGuardianRecord(
  organizationId: string,
  guardianInput: UpdateGuardianInput,
  patientInput: UpdatePatientInput,
): Promise<{ patient: PatientDTO; guardian: GuardianDTO }> {
  const guardian = await updateGuardian(organizationId, guardianInput);
  if (!guardian) throw new Error("Responsável não encontrado");

  const { id, ...rest } = patientInput;
  const patient = await updatePatient(organizationId, id, rest);
  if (!patient) throw new Error("Paciente não encontrado");

  return { patient, guardian };
}
