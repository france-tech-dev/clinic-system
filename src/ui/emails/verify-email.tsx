import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "react-email";

type VerifyEmailProps = {
  userName: string;
  verificationUrl: string;
};

export function VerifyEmail({ userName, verificationUrl }: VerifyEmailProps) {
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>
        {" "}
        Verifique seu endereço de email para completar seu registro{" "}
      </Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-10 font-sans">
          <Container className="mx-auto max-w-150 rounded-lg bg-white p-10 shadow-sm">
            <Section>
              <Heading className="mb-6 text-center text-2xl font-bold text-gray-900">
                Verifique seu endereço de email
              </Heading>

              <Text className="mb-4 text-base text-gray-700">
                Olá{userName ? `, ${userName}` : ""}!
              </Text>

              <Text className="mb-4 text-base text-gray-700">
                Obrigado por se cadastrar! Estamos ansiosos para ter você na
                equipe. Para completar seu registro e começar a usar sua conta,
                por favor verifique seu endereço de email clicando no botão
                abaixo.
              </Text>

              <Section className="my-8 text-center">
                <Button
                  href={verificationUrl}
                  className="box-border rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white no-underline"
                >
                  Verificar endereço de email
                </Button>
              </Section>

              <Text className="mb-4 text-sm text-gray-600">
                Se o botão acima não funcionar, você também pode copiar e colar
                o link abaixo no seu navegador:
              </Text>

              <Text className="mb-6 break-all text-sm text-blue-600">
                {verificationUrl}
              </Text>

              <Text className="mb-4 text-sm text-gray-600">
                Este link de verificação expirará em 24 horas por motivos de
                segurança.
              </Text>

              <Text className="text-sm text-gray-600">
                Se você não criou uma conta conosco, pode ignorar este email com
                segurança.
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
