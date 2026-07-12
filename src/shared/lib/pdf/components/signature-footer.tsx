import { Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "../styles/shared";

type SignatureFooterProps = {
  signature: string;
};

export function SignatureFooter({ signature }: SignatureFooterProps) {
  return (
    <View style={pdfStyles.signatureBlock}>
      <Text style={pdfStyles.signatureText}>{signature}</Text>
      <Text style={pdfStyles.signatureHint}>Assinatura do profissional</Text>
    </View>
  );
}
