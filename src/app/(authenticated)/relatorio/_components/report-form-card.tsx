import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { paths } from "@/shared/constants/paths";
import type { RelatorioFormViewModel } from "./hooks/use-relatorio-form";
import { EvaluationReportContentField } from "@/features/patient/components/evaluation-report-content-field";
import { EvaluationSelectField } from "./evaluation-select-field";
import { PatientSelectField } from "./patient-select-field";
import { ReportModeField } from "./report-mode-field";
import { RoteiroSelectFields } from "./roteiro-select-fields";

export function ReportFormCard({ form }: { form: RelatorioFormViewModel }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">Novo relatório</CardTitle>
        <CardDescription>
          Os relatórios usam a identidade visual configurada em{" "}
          <Link href={paths.configuracoes} className="text-primary hover:underline">
            Configurações
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <PatientSelectField
          search={form.search}
          onSearchChange={form.setSearch}
          patientId={form.patientId}
          onPatientChange={form.handlePatientChange}
          filteredPatients={form.filteredPatients}
          selectedPatient={form.selectedPatient}
        />

        <ReportModeField
          mode={form.mode}
          previewTitle={form.previewTitle}
          onModeChange={form.handleModeChange}
        />

        {form.mode === "evaluation" ? (
          <>
            <EvaluationSelectField
              patientId={form.patientId}
              evaluationId={form.evaluationId}
              evaluations={form.evaluations}
              pending={form.pending}
              onEvaluationChange={form.handleEvaluationChange}
            />
            {form.selectedEvaluation ? (
              <EvaluationReportContentField
                evaluation={form.selectedEvaluation}
                options={form.evaluationReportOptions}
                onChange={form.setEvaluationReportOptions}
                disabled={form.pending}
              />
            ) : null}
          </>
        ) : null}

        {form.mode === "roteiro" ? (
          <RoteiroSelectFields
            roteiroId={form.roteiroId}
            roteiroTick={form.roteiroTick}
            categories={form.currentRoteiro.categories}
            onRoteiroChange={form.handleRoteiroChange}
            onCategoryChange={form.setRoteiroTick}
          />
        ) : null}

        <Button
          className="w-full sm:w-auto"
          disabled={!form.patientId || form.pending}
          onClick={form.previewReport}
        >
          <FileText className="size-4" />
          {form.pending ? "Carregando…" : "Gerar relatório"}
        </Button>
      </CardContent>
    </Card>
  );
}
