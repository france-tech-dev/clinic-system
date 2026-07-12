"use client";

import type { EvaluationDTO } from "@/features/patient/patient.types";
import {
  EVALUATION_REPORT_SECTIONS,
  setAllEvaluationDomains,
  setAllEvaluationSections,
  setEvaluationDomain,
  setEvaluationSection,
  type EvaluationReportOptions,
} from "@/features/patient/_lib/pdf/evaluation-report-options";
import { categoryOf } from "@/shared/constants/exercise-categories";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function EvaluationReportContentField({
  evaluation,
  options,
  onChange,
  disabled = false,
}: {
  evaluation: EvaluationDTO;
  options: EvaluationReportOptions;
  onChange: (options: EvaluationReportOptions) => void;
  disabled?: boolean;
}) {
  const allSectionsSelected = EVALUATION_REPORT_SECTIONS.every(
    (section) => options.sections[section.id],
  );
  const allDomainsSelected =
    evaluation.domains.length > 0 &&
    evaluation.domains.every((domain) =>
      options.domainIds.includes(domain.categoryId),
    );

  return (
    <div className="space-y-4 rounded-md border border-border bg-muted/20 p-4">
      <div>
        <p className="text-sm font-medium">Conteúdo do relatório</p>
        <p className="text-xs text-muted-foreground">
          Escolha quais seções e domínios entram no PDF desta avaliação.
        </p>
      </div>

      <fieldset className="space-y-3" disabled={disabled}>
        <div className="flex items-center justify-between gap-2">
          <legend className="text-xs font-medium text-muted-foreground">
            Seções
          </legend>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() =>
              onChange(setAllEvaluationSections(options, !allSectionsSelected))
            }
          >
            {allSectionsSelected ? "Desmarcar todas" : "Marcar todas"}
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {EVALUATION_REPORT_SECTIONS.map((section) => (
            <label
              key={section.id}
              htmlFor={`report-section-${section.id}`}
              className="flex items-center gap-2 text-sm"
            >
              <Checkbox
                id={`report-section-${section.id}`}
                checked={options.sections[section.id]}
                onCheckedChange={(checked) =>
                  onChange(
                    setEvaluationSection(options, section.id, checked === true),
                  )
                }
              />
              {section.label}
            </label>
          ))}
        </div>
      </fieldset>

      {evaluation.domains.length > 0 ? (
        <fieldset className="space-y-3" disabled={disabled}>
          <div className="flex items-center justify-between gap-2">
            <legend className="text-xs font-medium text-muted-foreground">
              Domínios
            </legend>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                onChange(
                  setAllEvaluationDomains(
                    options,
                    evaluation,
                    !allDomainsSelected,
                  ),
                )
              }
            >
              {allDomainsSelected ? "Desmarcar todos" : "Marcar todos"}
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {evaluation.domains.map((domain) => {
              const id = `report-domain-${domain.categoryId}`;
              return (
                <label
                  key={domain.categoryId}
                  htmlFor={id}
                  className="flex items-center gap-2 text-sm"
                >
                  <Checkbox
                    id={id}
                    checked={options.domainIds.includes(domain.categoryId)}
                    onCheckedChange={(checked) =>
                      onChange(
                        setEvaluationDomain(
                          options,
                          domain.categoryId,
                          checked === true,
                        ),
                      )
                    }
                  />
                  {categoryOf(domain.categoryId).label}
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <p className="text-xs text-muted-foreground">
          Esta avaliação não possui domínios registrados.
        </p>
      )}

      <Label className="text-xs font-normal text-muted-foreground">
        Pelo menos uma seção ou domínio deve permanecer selecionado.
      </Label>
    </div>
  );
}
