import { auth } from "@/shared/lib/auth";
import { createCredentialUser } from "@/shared/lib/create-credential-user";
import { Role } from "../../../prisma/generated/prisma/enums";
import { toGuardianDTO } from "./_lib/mappers";
import { guardianRepository } from "./guardian.repository";
import type {
  CreateGuardianInput,
  EnableGuardianPortalInput,
  GuardianFormInput,
  UpdateGuardianInput,
} from "./guardian.schema";
import type { CreatedGuardianDTO, GuardianDTO } from "./guardian.types";

async function assertCpfAvailable(
  organizationId: string,
  cpf: string | null | undefined,
  excludeId?: string,
) {
  if (!cpf) return;
  const duplicate = await guardianRepository.findByCpf(
    organizationId,
    cpf,
    excludeId,
  );
  if (duplicate) {
    throw new Error("Já existe um responsável com este CPF nesta clínica.");
  }
}

async function provisionPortalAccess(opts: {
  organizationId: string;
  guardianId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<GuardianDTO> {
  const email = opts.email.trim().toLowerCase();
  const existingUser = await guardianRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error("Já existe um utilizador com este e-mail");
  }

  const user = await createCredentialUser({
    name: opts.name.trim(),
    email,
    phone: opts.phone,
    password: opts.password,
  });

  await auth.api.addMember({
    body: {
      userId: user.id,
      organizationId: opts.organizationId,
      role: Role.CLIENT,
    },
  });

  const member = await guardianRepository.findMemberByUserId(
    opts.organizationId,
    user.id,
  );
  if (!member) {
    throw new Error("Membro CLIENT criado sem vínculo na organização");
  }

  const linked = await guardianRepository.linkUser(
    opts.organizationId,
    opts.guardianId,
    user.id,
  );
  if (!linked) {
    throw new Error("Responsável não encontrado");
  }

  return toGuardianDTO(linked);
}

export async function listGuardians(
  organizationId: string,
): Promise<GuardianDTO[]> {
  const rows = await guardianRepository.findMany(organizationId);
  return rows.map(toGuardianDTO);
}

export async function createGuardian(
  organizationId: string,
  input: CreateGuardianInput,
): Promise<CreatedGuardianDTO> {
  await assertCpfAvailable(organizationId, input.cpf);

  const form: GuardianFormInput = {
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

  const created = await guardianRepository.create(organizationId, form);
  let dto = toGuardianDTO(created);
  let mustChangePassword = false;

  if (input.enablePortalAccess) {
    if (!input.email) {
      throw new Error("E-mail é obrigatório para acesso ao portal");
    }
    dto = await provisionPortalAccess({
      organizationId,
      guardianId: created.id,
      name: input.name,
      email: input.email,
      phone: input.phone ?? "",
      password: input.password,
    });
    mustChangePassword = true;
  }

  return { ...dto, mustChangePassword };
}

export async function updateGuardian(
  organizationId: string,
  input: UpdateGuardianInput,
): Promise<GuardianDTO | null> {
  const { id, ...form } = input;
  await assertCpfAvailable(organizationId, form.cpf, id);
  const row = await guardianRepository.update(organizationId, id, form);
  return row ? toGuardianDTO(row) : null;
}

export async function enableGuardianPortalAccess(
  organizationId: string,
  input: EnableGuardianPortalInput,
): Promise<CreatedGuardianDTO> {
  const guardian = await guardianRepository.findById(organizationId, input.id);
  if (!guardian) {
    throw new Error("Responsável não encontrado");
  }
  if (guardian.userId) {
    throw new Error("Este responsável já tem acesso ao portal");
  }
  if (!guardian.email) {
    throw new Error(
      "Defina um e-mail no responsável antes de criar o acesso ao portal",
    );
  }

  const dto = await provisionPortalAccess({
    organizationId,
    guardianId: guardian.id,
    name: guardian.name,
    email: guardian.email,
    phone: guardian.phone,
    password: input.password,
  });

  return { ...dto, mustChangePassword: true };
}
