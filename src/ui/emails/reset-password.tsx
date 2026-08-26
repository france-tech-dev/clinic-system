import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

type ResetPasswordEmailProps = {
  userName: string;
  resetUrl: string;
};

export function ResetPasswordEmail({
  userName,
  resetUrl,
}: ResetPasswordEmailProps) {
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>Redefina sua senha para continuar acessando sua conta</Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-10 font-sans">
          <Container className="mx-auto max-w-150 rounded-lg bg-white p-10 shadow-sm">
            <Section>
              <Heading className="mb-6 text-center text-2xl font-bold text-gray-900">
                Redefinição de senha
              </Heading>

              <Text className="mb-4 text-base text-gray-700">
                Olá{userName ? `, ${userName}` : ""}!
              </Text>

              <Text className="mb-4 text-base text-gray-700">
                Recebemos uma solicitação para redefinir a senha da sua conta.
                Clique no botão abaixo para criar uma nova senha com segurança.
              </Text>

              <Section className="my-8 text-center">
                <Button
                  href={resetUrl}
                  className="box-border rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white no-underline"
                >
                  Redefinir senha
                </Button>
              </Section>

              <Text className="mb-4 text-sm text-gray-600">
                Se o botão acima não funcionar, você também pode copiar e colar
                o link abaixo no seu navegador:
              </Text>

              <Text className="mb-6 break-all text-sm text-blue-600">
                {resetUrl}
              </Text>

              <Text className="mb-4 text-sm text-gray-600">
                Se você não solicitou a redefinição, ignore este email. Sua
                senha atual permanecerá a mesma.
              </Text>
            </Section>

            <Section className="mt-8 border-t border-gray-200 pt-6">
              <Text className="m-0 text-center text-xs text-gray-500">
                © 2026 Movi Clinicas. Todos os direitos reservados.
              </Text>
              <Text className="m-0 text-center text-xs text-gray-500">
                São José, SC.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
