# Scoring oficial — instrumentos TO (PEDI, SPM, Perfil Sensorial)

**Data da pesquisa:** 2026-08-27  
**Objectivo:** mapear fontes oficiais, o que é público vs. licenciado, e o alinhamento com os templates em `src/domains/protocol/evaluation-modules/terapia-ocupacional/`.  
**Aviso:** este documento **não** reproduz tabelas de conversão (raw → scaled/T-score). Essas tabelas são propriedade intelectual dos editores; copiá-las para o código sem licença é risco legal e clínico.

Relacionado: [`docs/ai.md`](../ai.md) · [`docs/bounded-contexts.md`](../bounded-contexts.md) · código actual `computeItemProtocolRawScores` (só bruto).

---

## Templates actuais vs manuais

Os `template.json` / rotas de avaliação TO deste projecto foram digitalizados a partir de formulários em uso clínico; **não** foram digitados directamente a partir dos manuais Pearson/WPS/Hogrefe. Por isso a estrutura do app pode divergir do papel oficial.

| Implicação                                    | Detalhe                                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Estrutura (itens, secções, Casa/Escola 2/3/5) | Pode divergir do papel oficial (ex. PEDI mobilidade **69** no app vs **59** no manual)                        |
| Scoring / gráficos “oficiais”                 | Tabelas normativas **não** estão no código; embutir scaled/T-score/bandas exige licença dos editores          |
| Próximo passo prático                         | Auditar item-a-item com o **manual** que a clínica usa; corrigir templates; só então fechar scoring + gráfico |

---

## Resumo executivo

| Instrumento                              | Editor / fonte                                     | Score normativo                                       | Tabelas públicas?                                        | No nosso código                                                                          |
| ---------------------------------------- | -------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **PEDI** (Functional Skills)             | Pearson (US); versão BR Mancini/UFMG 2005          | Raw → **scaled** (0–100) + standard score por idade   | **Não** (manual)                                         | 3 protocolos; raw possível; mobilidade **69 vs 59 oficiais**                             |
| **SPM / SPM-P** (legado)                 | WPS                                                | Raw → **T-score** + bandas                            | **Não** (manual); bandas descritas em materiais oficiais | 6 formulários Casa/Escola × 2/3/5 anos; contagens ≈ SPM legado, **não** SPM-2 (80 itens) |
| **SPM-2** (actual)                       | WPS (2021)                                         | Raw → T-score + bandas (rótulos actualizados)         | **Não** (manual / OES)                                   | **Não implementado** como produto actual                                                 |
| **Perfil Sensorial 2 — Criança Pequena** | Pearson (Dunn); BR **Hogrefe CETEPP** (desde 2022) | Raw por secção/quadrante → **cut scores** / percentis | **Não** (manual / Q-global / Q Plataforma)               | 54 itens / 7 secções — **alinha** ao Toddler SP2                                         |

**Conclusão para o produto:** a referência normativa é o **manual** (Pearson / WPS / Hogrefe / Mancini). Podemos implementar **raw + gráfico de evolução** alinhados à estrutura actual (ou à estrutura corrigida após auditoria). **Scaled / T-score / bandas** exigem licença do editor (ou API oficial).

**Contactos de licenciamento (pesquisa 2026-08-27):** Pearson `pas.licensing@pearson.com` · WPS `rights@wpspublish.com` · Terms Pearson proíbem explicitamente meter conteúdo em scoring engines de terceiros sem autorização escrita.

---

## Checklist de verificação (clínica / produto)

Usar esta lista ao decidir a fase seguinte:

- [ ] Confirmar com a clínica qual edição física/digital possuem: PEDI US vs **PEDI BR (Mancini 2005)**; SPM vs SPM-P vs **SPM-2**; Perfil Sensorial 1 vs **Perfil Sensorial 2**.
- [ ] Auditar `pedi-mobilidade/template.json` (69 itens) vs manual (59 itens) — ver secção PEDI.
- [ ] Auditar SPM Casa/Escola 2/3/5 anos vs formulários do kit (item counts 75/62 vs SPM-2 = 80).
- [ ] Decidir caminho normativo: (A) só bruto + evolução; (B) tabelas após licença do editor; (C) Q-global / WPS OES.
- [ ] Não rotular UI como “T-score / scaled oficial” enquanto as tabelas não estiverem licenciadas e validadas.
- [ ] Se SPM: obter lista oficial de itens com **scoring invertido (SOC)** antes de confiar no raw.

---

## 1. PEDI — Pediatric Evaluation of Disability Inventory

### Fontes oficiais / de referência

| Fonte                                           | URL                                                                                                                                                                | Notas                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| Pearson Assessments (US) — produto PEDI         | https://www.pearsonassessments.com/en-us/Store/Professional-Assessments/Developmental-Early-Childhood/Pediatric-Evaluation-of-Disability-Inventory/p/100000505     | Idade 6 m–7 a; scoring manual; normas Standard + Scaled |
| Pearson Clinical UK                             | https://www.pearsonclinical.co.uk/en-gb/Store/Professional-Assessments/Developmental-Early-Childhood/Pediatric-Evaluation-of-Disability-Inventory/p/P100009069     | Venda de manual + formulários                           |
| ePROVIDE / Mapi — descrição + copyright Pearson | https://eprovide.mapi-trust.org/instruments/pediatric-evaluation-of-disability-inventory                                                                           | Copyright Pearson Assessment                            |
| RehabMeasures (Shirley Ryan AbilityLab)         | https://www.sralab.org/rehabilitation-measures/pediatric-evaluation-disability-inventory                                                                           | Resumo clínico: 197 itens Functional Skills (73+59+65)  |
| Manual BR adaptado — Mancini, M.C. (2005), UFMG | LILACS: https://pesquisa.bvsalud.org/portal/resource/pt/biblio-870547 · ScienceOpen: https://www.scienceopen.com/document?vid=491ae111-0e80-4fbd-8c16-aefa62535e6d | Referência padrão em estudos BR                         |
| PEDI-CAT Pearson                                | https://www.pearsonassessments.com/en-us/Store/Professional-Assessments/Behavior/Pediatric-Evaluation-of-Disability-Inventory-Computer-Adaptive-Test/p/100002037   | CAT + Q-global; **não** é o PEDI papel do app           |
| FAQ PEDI vs PEDI-CAT (CRE Care)                 | https://www.pedicat.com/faq/                                                                                                                                       | Diferenças oficiais de domínio/escala/scoring           |
| Terms of Sale/Use Pearson (IP)                  | https://www.pearsonassessments.com/footer/terms-of-sale---use.html                                                                                                 | Compra do manual **≠** direito a digitalizar tabelas    |

### Algoritmo público (sem tabelas)

**Parte I — Functional Skills** (o que o app cobre hoje, dividido em 3 protocolos):

1. Cada item: `0` = não capaz / `1` = capaz (na rotina).
2. **Raw score** da escala = soma dos itens daquela escala.
3. Contagens oficiais (US e literatura BR sobre Mancini):

| Escala        | Itens oficiais | Protocolo no app     | Itens no template (2026-08-27) |
| ------------- | -------------: | -------------------- | -----------------------------: |
| Autocuidado   |             73 | `pedi-autocuidado`   |                       **73** ✓ |
| Mobilidade    |         **59** | `pedi-mobilidade`    |                       **69** ✗ |
| Função social |             65 | `pedi-funcao-social` |                       **65** ✓ |
| Total Parte I |            197 | —                    |                            207 |

> **Nota:** os 69 itens de mobilidade no template **divergem** do manual Mancini/Pearson (59). Auditar e alinhar ao manual antes de rotular score como oficial.

**Partes II e III** (Caregiver Assistance 0–5; Modifications N/C/R/E) — **não** estão nos nossos módulos actuais.

### Score normativo (pago / manual)

- **Scaled score (0–100):** transformação Rasch a partir do raw; independente da idade; usada para evolução ao longo do tempo.
- **Normative standard score:** compara com amostra normativa por faixa etária.
- Tabelas: manual de administração/padronização (Pearson 1992; versão BR Mancini 2005). **Não** encontradas como download livre e licitamente reutilizável em software.

### Implicações para o Clinic System

1. Implementar **raw oficial** por escala (e por secção A, B, C… como no formulário) é correcto e útil.
2. **Corrigir/auditar mobilidade** antes de qualquer “score oficial” — 10 itens a mais invalidam raw vs manual.
3. Scaled/standard: só com manual licenciado + autorização de uso digital (`pas.licensing@pearson.com`), Q-global API (se elegível), ou o clínico introduz o scaled já obtido do manual.
4. Gráfico GMFM-like: eixo natural = **scaled** (quando existir) ou, interinamente, **raw** / % do máximo da escala, **rotulado como bruto**.
5. **Não** reimplementar PEDI-CAT no app — scoring só via Q-global.

---

## 2. SPM — Sensory Processing Measure (e SPM-2)

### Fontes oficiais / de referência

| Fonte                                       | URL                                                                                         | Notas                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| WPS — SPM-2                                 | https://www.wpspublish.com/spm-2                                                            | Produto canónico; kits/OES pagos                                    |
| WPS Online Evaluation System                | https://platform.wpspublish.com                                                             | Scoring/relatórios oficiais                                         |
| WPS Rights & Permissions                    | https://www.wpspublish.com/copyrights-permissions                                           | Licença comercial para software                                     |
| Sample Cap. 1 Manual SPM-2 (PAA)            | https://paa.com.au/wp-content/uploads/2026/03/01_spm2_manual_ch_sample_041621_1.pdf         | Likert, T-scores, bandas                                            |
| Sample report Preschool School (PAA)        | https://paa.com.au/wp-content/uploads/2026/03/spm-2_preschool_school_form_sample_report.pdf | Exemplo + nota de **reversão SOC**                                  |
| Webinar WPS SPM/SPM-P ranges                | https://pages.wpspublish.com/hubfs/SPM_QT_Webinar_FINAL_2020-1.pdf                          | Faixas T (SPM legado)                                               |
| NZCER — ficha produto                       | https://www.nzcer.org.nz/pts/spm-2-sensory-processing-measure                               | Faixas etárias SPM-2                                                |
| Manual SPM original (Home / Main Classroom) | Proprietário WPS — **não** republicar tabelas                                               | Home ≈ **75** itens; Main Classroom ≈ **62** (alinha aos `*-5anos`) |

### Algoritmo público (sem tabelas)

1. Respostas: Never / Occasionally / Frequently / Always → tipicamente **1 / 2 / 3 / 4** (maior = mais dificuldade).
2. **Reversão obrigatória** na escala Social Participation (SOC) e itens indicados no manual. **Sem a lista oficial de itens invertidos, o raw está errado.**
3. **Raw score** por escala = soma dos itens (após reversão); escalas: Social Participation, Vision, Hearing, Touch, Taste/Smell, Body Awareness, Balance & Motion, Planning & Ideation (+ Total Sensory Systems quando aplicável).
4. Conversão **raw → T-score** (média 50, DP 10) via tabelas do manual / AutoScore / OES.

### Bandas interpretativas (materiais oficiais — confirmar no manual da edição)

| Edição          | T ≈ 40–59 | T ≈ 60–69                 | T ≥ 70                   |
| --------------- | --------- | ------------------------- | ------------------------ |
| **SPM / SPM-P** | Typical   | **Some Problems**         | **Definite Dysfunction** |
| **SPM-2**       | Typical   | **Moderate Difficulties** | **Severe Difficulties**  |

Não misturar rótulos entre edições na UI.

### Alinhamento com o app

| Protocolo app                |  Itens | Secções | Parece                                                                              |
| ---------------------------- | -----: | ------: | ----------------------------------------------------------------------------------- |
| `spm-casa-2anos` / `3anos`   |     75 |       8 | SPM-P / Casa pré-escolar (legado), **não** SPM-2 Preschool (80 itens, 1 form 2–5 a) |
| `spm-casa-5anos`             |     75 |       8 | SPM Home (legado)                                                                   |
| `spm-escola-2anos` / `3anos` |     75 |       8 | Variante escola pré-escolar                                                         |
| `spm-escola-5anos`           | **62** |       8 | SPM Main Classroom (legado)                                                         |

**SPM-2 Preschool oficial:** um Home + um School para **2–5 anos**, ~**80** itens cada — **não** SKUs “2 / 3 / 5 anos”. Aos **5 anos** há overlap Preschool vs Child — a regra correcta está no manual/OES.

Os módulos `*-2anos` / `*-3anos` / `*-5anos` no app são **organização clínica por idade**, não catálogo WPS. Normas oficiais usam o **nível** (Preschool vs Child) + stratum etário interno do formulário.

### Implicações

1. Não aplicar tabelas **SPM-2** aos templates actuais sem prova de equivalência item-a-item.
2. Confirmar com a clínica se usam **SPM / SPM-P** (legado) ou **SPM-2**.
3. Raw + gráfico por escala é seguro **só depois** de implementar reversão SOC conforme o manual da edição.
4. T-score / bandas: licença WPS (`rights@wpspublish.com`) ou OES — compra de kits sozinha **não** autoriza embutir tabelas.

---

## 3. Perfil Sensorial (Criança Pequena) — Sensory Profile 2 Toddler

**Não confundir com ITSP 2002** (Infant/Toddler Sensory Profile): 7–36 m com **48** itens e bandas _Typical / Probable / Definite Difference_. O módulo do app (54 itens, 7–35 m) corresponde ao **Sensory Profile 2 — Toddler / Perfil Sensorial 2 Criança Pequena**.

### Fontes oficiais / de referência

| Fonte                                  | URL                                                                                                                                    | Notas                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Pearson US — Sensory Profile 2         | https://www.pearsonassessments.com/en-us/Store/Professional-Assessments/Motor-Sensory/Sensory-Profile-2/p/100000822                    | Manual + Q-global                                       |
| Q-global — Entering SP2 Scores         | https://qglobal.pearsonclinical.com/qg/static/Product/en/SP2/SP2_Enter_Scores.htm                                                      | Toddler: 7–35 m; **54** itens; 7 secções + 4 quadrantes |
| Technical Summary SP2 (PDF)            | https://www.pearsonassessments.com/content/dam/school/global/clinical/us/assets/sensoyprofile2/sensory-profile-2-technical-summary.pdf | Psicometria; **sem** cut brutos                         |
| Brasil Assessments (Pearson → Hogrefe) | https://www.pearsonassessments.com/professional-assessments/ordering/brasil-assessments.html                                           | Desde **2022**: **Hogrefe CETEPP** + Q Plataforma Web   |
| Hogrefe BR — Perfil Sensorial 2        | https://hogrefe.com.br/perfil-sensorial.html                                                                                           | Distribuidor oficial BR actual                          |

### Algoritmo público

1. Escala de frequência (no app: 5→1; 0 = N/A excluído da soma) — alinhada ao modelo Dunn / SP2.
2. **Raw** por secção e, no scoring oficial, por **quadrantes** (Seeking, Avoiding, Sensitivity, Registration).
3. Classificação SP2 (linguagem dos reports — **não** usar rótulos ITSP): Much Less / Less / **Just Like the Majority of Others** / More / Much More Than Others. Valores exactos **só** no manual.

### Alinhamento com o app

|         | Oficial Toddler SP2                                                | `perfil-sensorial-crianca-pequena` |
| ------- | ------------------------------------------------------------------ | ---------------------------------- |
| Idade   | 7–35 meses                                                         | (nome do módulo)                   |
| Itens   | 54                                                                 | **54** ✓                           |
| Secções | 7 (Geral, Auditivo, Visual, Tato, Movimento, Oral, Comportamental) | **7** com títulos equivalentes ✓   |

**Lacuna:** scoring oficial também produz **quadrantes**; o template actual só agrega por secção.

### Implicações

1. Melhor candidato estrutural após compra do manual Hogrefe/Pearson: item count já bate.
2. UI de bandas: linguagem **SP2**, não “Typical / Probable / Definite” (ITSP).
3. Preferir Q-global / Q Plataforma Web ou classificação introduzida pelo clínico — **não** hardcodar cuts.
4. Enquanto isso: raw por secção + gráfico bruto, sem bandas inventadas.

---

## 4. Licenciamento e software de terceiros

| Caminho                                                   | Viabilidade                                                                                   | Notas                                                             |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Copiar tabelas do manual para o nosso repo                | **Não**, sem contrato                                                                         | Copyright Pearson / WPS / autores                                 |
| Comprar manual e digitar tabelas “porque somos a clínica” | **Zona cinzenta** — tipicamente o manual **não** autoriza redistribuição em SaaS multi-tenant | Consultar jurídico + editor                                       |
| Pearson **Q-global API**                                  | Preferível para produtos Pearson                                                              | Scoring no lado Pearson; confirmar elegibilidade (SP2 / PEDI-CAT) |
| WPS **OES** + licença comercial                           | Preferível para SPM-2                                                                         | `rights@wpspublish.com`                                           |
| Só raw + UI de evolução                                   | **OK**                                                                                        | Alinhado a `docs/ai.md` e ao código actual                        |

Referências:

- Q-global API: https://www.pearsonassessments.com/campaign/q-global-application-programming-interface.html
- Q-global License Agreement: https://www.pearsonassessments.com/content/dam/school/global/clinical/us/assets/q-global/Q-global-License-Agreement.pdf
- Pearson Terms (IP): https://www.pearsonassessments.com/footer/terms-of-sale---use.html
- WPS Rights: https://www.wpspublish.com/copyrights-permissions

---

## 5. Proposta de fases (após verificação)

### Fase A — seguro agora (recomendado)

1. Auditar e corrigir templates face ao **manual** (prioridade: **PEDI mobilidade** 69 → 59).
2. Scoring determinístico **raw** por secção/escala (estender `computeItemProtocolRawScores` / novo `item-protocol-scoring.ts`).
3. Popular `summary` no DTO (generalizar além do GMFM).
4. UI: totais no formulário + gráfico comparativo **bruto** (rótulo explícito).
5. Manter IA sem inventar T-scores.
6. SPM: só expor raw após reversão SOC (lista do manual da edição usada).

### Fase B — normativo oficial

1. Clínica confirma edições + fornece manuais / prova de compra.
2. Jurídico / editor: licença de uso digital **ou** integração Q-global / WPS OES.
3. Só então: scaled / T-score / bandas + gráfico normativo + PDF.

### Fase C — alinhamento de produto SPM

1. Se a clínica migrar para SPM-2: novos templates 80 itens + um form Preschool 2–5 (em vez de 2/3/5).
2. Se permanecer no legado: documentar “SPM / SPM-P” no catálogo e usar **esse** manual.

---

## 6. O que **não** foi encontrado (pesquisa 2026-08-27)

- Download livre e licitamente redistribuível das tabelas raw→scaled (PEDI) ou raw→T-score (SPM) para embutir em SaaS.
- Confirmação de que os nossos SPM “2 / 3 / 5 anos” são um produto oficial separado (parecem fragmentação local / portal legado, não SPM-2).
- API pública aberta (sem contrato) que devolva scores oficiais.

---

## 7. Mapa rápido: ficheiros do projecto

| Papel               | Path                                                                             |
| ------------------- | -------------------------------------------------------------------------------- |
| Templates TO        | `src/domains/protocol/evaluation-modules/terapia-ocupacional/**/template.json`   |
| Escalas de resposta | `src/domains/protocol/evaluation-modules/_shared/item-scale.ts`                  |
| Raw actual (IA)     | `src/domains/protocol/_lib/interpretationAI/raw-section-scores.ts`               |
| Summary só GMFM     | `src/domains/protocol/protocol.service.ts` (`toDTO`)                             |
| Chart referência    | `src/features/protocol/evaluation-modules/_shared/protocol-comparison-chart.tsx` |
| Client TO           | `src/features/protocol/evaluation-modules/_shared/item-protocol-client.tsx`      |

---

## 8. Fontes consultadas (agentes + pesquisa web)

Pesquisa 2026-08-27 via WebSearch/WebFetch + agentes:

- [Research PEDI official norms](56df0fb1-30f6-4ca5-9629-d847a69bce84)
- [Research SPM official norms](1aadedc6-7f53-488a-8213-2fc20b122a26)
- [Research Sensory Profile norms](8610be5d-3c47-419e-879a-e934eacb74e0)

URLs oficiais nas secções 1–4. Estudos BR só para **contagens de itens** e referência Mancini — não como substituto das tabelas normativas. PDFs não oficiais (ex. PDFCoffee) **não** são fonte.

**Próximo passo sugerido:** a clínica preenche o checklist; depois Fase A (bruto + gráfico, com reversão SOC se SPM) e/ou caminho B (licença / API).
