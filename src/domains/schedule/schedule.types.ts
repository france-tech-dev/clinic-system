import type {
  AppointmentStatus,
  PatientPricingType,
} from "@prisma/enums";

export type ScheduleMemberDTO = {
  id: string;
  userId: string;
  name: string;
  role: string;
};

export type AppointmentDTO = {
  id: string;
  patientId: string;
  patientName: string;
  memberId: string;
  professionalName: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
  status: AppointmentStatus;
  hasSessionNote: boolean;
  patientPricingType: PatientPricingType;
  patientPrice: number | null;
  createdAt: string;
  updatedAt: string;
};
