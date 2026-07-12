import Link from "next/link";
import { Search } from "lucide-react";
import { formatPatientListMeta } from "@/features/patient/_lib/patient-list-meta";
import type { PatientDTO } from "@/features/patient/patient.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { paths } from "@/shared/constants/paths";

export function PatientSelectField({
  search,
  onSearchChange,
  patientId,
  onPatientChange,
  filteredPatients,
  selectedPatient,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  patientId: string;
  onPatientChange: (id: string) => void;
  filteredPatients: PatientDTO[];
  selectedPatient: PatientDTO | null;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="patient-search">Paciente</Label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="patient-search"
          className="pl-9"
          placeholder="Buscar paciente…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={patientId} onValueChange={onPatientChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um paciente" />
        </SelectTrigger>
        <SelectContent>
          {filteredPatients.length === 0 ? (
            <SelectItem value="__empty" disabled>
              Nenhum paciente encontrado
            </SelectItem>
          ) : (
            filteredPatients.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {selectedPatient ? (
        <p className="text-xs text-muted-foreground">
          {formatPatientListMeta(selectedPatient)}
          {" · "}
          <Link
            href={paths.paciente(selectedPatient.id)}
            className="text-primary hover:underline"
          >
            Abrir prontuário
          </Link>
        </p>
      ) : null}
    </div>
  );
}
