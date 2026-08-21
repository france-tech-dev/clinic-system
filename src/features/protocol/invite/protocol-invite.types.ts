export type ProtocolInviteItemStatus = "pending" | "submitted";

export type ProtocolInviteItemDTO = {
  id: string;
  protocolId: string;
  protocolName: string;
  status: ProtocolInviteItemStatus;
  totalCount: number;
  submittedAt: string | null;
};

export type ProtocolInviteDTO = {
  id: string;
  token: string;
  publicUrl: string;
  patientId: string;
  patientName: string;
  organizationId: string;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  items: ProtocolInviteItemDTO[];
  allSubmitted: boolean;
  isExpired: boolean;
  isRevoked: boolean;
  isActive: boolean;
};

export type PublicProtocolInviteDTO = {
  token: string;
  patientFirstName: string;
  patientInitials: string;
  therapistName: string | null;
  clinicName: string;
  expiresAt: string | null;
  allSubmitted: boolean;
  items: ProtocolInviteItemDTO[];
};

export type PublicProtocolInviteInstrumentDTO = {
  token: string;
  protocolId: string;
  protocolName: string;
  patientFirstName: string;
  clinicName: string;
  status: ProtocolInviteItemStatus;
  responses: Record<string, number | string | null>;
  submittedAt: string | null;
};
