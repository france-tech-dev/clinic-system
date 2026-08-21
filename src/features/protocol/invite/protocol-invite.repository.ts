import { db } from "@/shared/lib/prisma";

const inviteInclude = {
  patient: { select: { id: true, name: true } },
  organization: { select: { id: true, name: true } },
  createdByMember: {
    include: {
      user: { select: { name: true } },
    },
  },
  items: { orderBy: { createdAt: "asc" as const } },
} as const;

export const protocolInviteRepository = {
  async findMemberByUserId(organizationId: string, userId: string) {
    return db.member.findFirst({
      where: { organizationId, userId },
      select: { id: true },
    });
  },

  async findPatient(organizationId: string, patientId: string) {
    return db.patient.findFirst({
      where: { id: patientId, organizationId },
      select: { id: true, name: true },
    });
  },

  async create(data: {
    token: string;
    organizationId: string;
    patientId: string;
    createdByMemberId: string | null;
    expiresAt: Date | null;
    protocolIds: string[];
  }) {
    return db.protocolInvite.create({
      data: {
        token: data.token,
        organizationId: data.organizationId,
        patientId: data.patientId,
        createdByMemberId: data.createdByMemberId,
        expiresAt: data.expiresAt,
        items: {
          create: data.protocolIds.map((protocolId) => ({
            protocolId,
            status: "pending",
            responses: "{}",
          })),
        },
      },
      include: inviteInclude,
    });
  },

  async findByPatient(organizationId: string, patientId: string) {
    return db.protocolInvite.findMany({
      where: { organizationId, patientId },
      include: inviteInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(organizationId: string, id: string) {
    return db.protocolInvite.findFirst({
      where: { id, organizationId },
      include: inviteInclude,
    });
  },

  async findByToken(token: string) {
    return db.protocolInvite.findUnique({
      where: { token },
      include: inviteInclude,
    });
  },

  async revoke(organizationId: string, id: string) {
    const existing = await db.protocolInvite.findFirst({
      where: { id, organizationId },
      select: { id: true, revokedAt: true },
    });
    if (!existing) return null;
    if (existing.revokedAt) {
      return db.protocolInvite.findFirst({
        where: { id },
        include: inviteInclude,
      });
    }
    return db.protocolInvite.update({
      where: { id },
      data: { revokedAt: new Date() },
      include: inviteInclude,
    });
  },

  async updateItemResponses(itemId: string, responses: string, status: string) {
    return db.protocolInviteItem.update({
      where: { id: itemId },
      data: { responses, status },
    });
  },

  async submitItem(data: {
    itemId: string;
    organizationId: string;
    patientId: string;
    protocolId: string;
    scores: string;
    label: string;
    date: string;
  }) {
    return db.$transaction(async (tx) => {
      const evaluation = await tx.protocolEvaluation.create({
        data: {
          organizationId: data.organizationId,
          patientId: data.patientId,
          memberId: null,
          protocolId: data.protocolId,
          label: data.label,
          date: data.date,
          scores: data.scores,
          notes: "",
          inviteItemId: data.itemId,
        },
      });

      await tx.protocolInviteItem.update({
        where: { id: data.itemId },
        data: {
          status: "submitted",
          responses: data.scores,
          submittedAt: new Date(),
        },
      });

      return evaluation;
    });
  },
};
