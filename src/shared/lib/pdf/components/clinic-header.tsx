import { Image, Text, View } from "@react-pdf/renderer";
import { resolveLogoUrl } from "../resolve-logo-url";
import { pdfStyles } from "../styles/shared";

type ClinicHeaderProps = {
  clinicName: string;
  logoUrl: string;
  documentTitle: string;
  logoOrigin?: string;
};

export function ClinicHeader({
  clinicName,
  logoUrl,
  documentTitle,
  logoOrigin,
}: ClinicHeaderProps) {
  const resolvedLogo = resolveLogoUrl(logoUrl, logoOrigin);

  return (
    <View style={pdfStyles.header}>
      {resolvedLogo ? (
        // @react-pdf/renderer Image não expõe `alt` (não é elemento DOM).
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image style={pdfStyles.logo} src={resolvedLogo} />
      ) : null}
      <View style={pdfStyles.headerText}>
        <Text style={pdfStyles.clinicName}>{clinicName}</Text>
        <Text style={pdfStyles.documentTitle}>{documentTitle}</Text>
      </View>
    </View>
  );
}
