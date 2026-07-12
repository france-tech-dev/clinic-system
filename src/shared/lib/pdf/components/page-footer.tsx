import { Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "../styles/shared";

type PageFooterProps = {
  issuedAt?: Date;
};

function formatIssuedAt(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function PageFooter({ issuedAt = new Date() }: PageFooterProps) {
  return (
    <View style={pdfStyles.pageFooter} fixed>
      <Text>Emitido em {formatIssuedAt(issuedAt)}</Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          `Página ${pageNumber} de ${totalPages}`
        }
      />
    </View>
  );
}
