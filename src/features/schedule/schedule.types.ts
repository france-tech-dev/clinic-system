import type { AppointmentStatusId } from "@/shared/constants/appointment";

export type AppointmentDTO = {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
  status: AppointmentStatusId;
  createdAt: string;
  updatedAt: string;
};
