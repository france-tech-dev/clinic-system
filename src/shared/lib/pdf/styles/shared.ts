import { Font, StyleSheet } from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    lineHeight: 1.45,
    color: "#1a1a1a",
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 42,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
  },
  logo: {
    width: 56,
    height: 56,
    objectFit: "contain",
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  clinicName: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 3,
  },
  documentTitle: {
    fontSize: 11,
    color: "#525252",
  },
  patientLine: {
    marginBottom: 14,
    fontSize: 10,
  },
  patientName: {
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 6,
  },
  subsectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 4,
  },
  bulletItem: {
    marginLeft: 10,
    marginBottom: 2,
  },
  muted: {
    color: "#525252",
    fontStyle: "italic",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 4,
  },
  colItem: { width: "22%" },
  colObserve: { width: "38%", paddingRight: 6 },
  colClinical: { width: "40%" },
  signatureBlock: {
    marginTop: 28,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#d4d4d4",
  },
  signatureText: {
    fontSize: 10,
    fontWeight: 500,
    marginBottom: 20,
  },
  signatureHint: {
    fontSize: 9,
    color: "#737373",
  },
  pageFooter: {
    position: "absolute",
    bottom: 24,
    left: 42,
    right: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#737373",
  },
});
