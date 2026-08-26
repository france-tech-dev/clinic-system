# UI debt in `packages/domains`

Temporary: top-level `components/` and `hooks/` live in `apps/web/src/features/<domain>/`.
These `.tsx` files remain under domains (evaluation-modules / forms / PDF helpers) until a follow-up moves them without breaking barrels/registries.

## Leftover `.tsx` paths

- `packages/domains/src/anamnese/_lib/pdf/documents/anamnese-document.tsx`
- `packages/domains/src/anamnese/forms/terapia-ocupacional/anamnese-to/components/anamnese-field.tsx`
- `packages/domains/src/anamnese/forms/terapia-ocupacional/anamnese-to/components/anamnese-form-client.tsx`
- `packages/domains/src/anamnese/forms/terapia-ocupacional/anamnese-to/module.tsx`
- `packages/domains/src/patient/_lib/pdf/build-patient-report-document.tsx`
- `packages/domains/src/patient/_lib/pdf/documents/clinical-evaluation-document.tsx`
- `packages/domains/src/patient/_lib/pdf/documents/full-record-document.tsx`
- `packages/domains/src/patient/_lib/pdf/download-patient-report.tsx`
- `packages/domains/src/patient/_lib/pdf/sections/clinical-evaluation-section.tsx`
- `packages/domains/src/patient/_lib/pdf/sections/sessions-section.tsx`
- `packages/domains/src/protocol/evaluation-modules/_shared/create-item-module.tsx`
- `packages/domains/src/protocol/evaluation-modules/_shared/item-protocol-client.tsx`
- `packages/domains/src/protocol/evaluation-modules/fisioterapia/gmfm-88/components/comparison-chart.tsx`
- `packages/domains/src/protocol/evaluation-modules/fisioterapia/gmfm-88/components/evaluation-form.tsx`
- `packages/domains/src/protocol/evaluation-modules/fisioterapia/gmfm-88/components/protocol-client.tsx`
- `packages/domains/src/protocol/evaluation-modules/fisioterapia/gmfm-88/module.tsx`
- `packages/domains/src/protocol/evaluation-modules/terapia-ocupacional/pedi-autocuidado/module.tsx`
- `packages/domains/src/protocol/evaluation-modules/terapia-ocupacional/pedi-funcao-social/module.tsx`
- `packages/domains/src/protocol/evaluation-modules/terapia-ocupacional/pedi-mobilidade/module.tsx`
- `packages/domains/src/protocol/evaluation-modules/terapia-ocupacional/perfil-sensorial-crianca-pequena/module.tsx`
- `packages/domains/src/protocol/evaluation-modules/terapia-ocupacional/spm-casa-2anos/module.tsx`
- `packages/domains/src/protocol/evaluation-modules/terapia-ocupacional/spm-casa-3anos/module.tsx`
- `packages/domains/src/protocol/evaluation-modules/terapia-ocupacional/spm-casa-5anos/module.tsx`
- `packages/domains/src/protocol/evaluation-modules/terapia-ocupacional/spm-escola-2anos/module.tsx`
- `packages/domains/src/protocol/evaluation-modules/terapia-ocupacional/spm-escola-3anos/module.tsx`
- `packages/domains/src/protocol/evaluation-modules/terapia-ocupacional/spm-escola-5anos/module.tsx`

## Known boundary leak

`anamnese/forms/.../anamnese-form-client.tsx` still imports
`@/features/anamnese/components/anamnese-pdf-preview-dialog` (now resolved under
`apps/web/src/features`). That is a temporary domains → web UI edge until forms
move out of domains.
