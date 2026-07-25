/** Secção genérica label/valor para composição de PDF entre features (via app/). */
export type PdfKeyValueSection = {
  title: string;
  rows: { label: string; value: string }[];
};
