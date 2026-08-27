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
import { memberRoleLabel } from "@/shared/constants/member-role";
import type { Role } from "@prisma/enums";

type OrganizationInvitationEmailProps = {
  inviteUrl: string;
  inviterName: string;
  inviterEmail: string;
  organizationName: string;
  role: Role;
};

export function OrganizationInvitationEmail({
  inviteUrl,
  inviterName,
  organizationName,
  role,
}: OrganizationInvitationEmailProps) {
  const roleLabel = memberRoleLabel(role);
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>
        Convite para participar da organização {organizationName} na Boilerplate
      </Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-10 font-sans">
          <Container className="mx-auto max-w-150 rounded-lg bg-white p-10 shadow-sm">
            <Section>
              <Heading className="mb-6 text-center text-2xl font-bold text-gray-900">
                Você foi convidado
              </Heading>

              <Text className="mb-4 text-base text-gray-700">Olá!</Text>

              <Text className="mb-4 text-base text-gray-700">
                <span className="font-medium">{inviterName}</span> convidou você
                para entrar na organização{" "}
                <span className="font-medium">{organizationName}</span> na
                plataforma Boilerplate, com o papel de{" "}
                <span className="font-medium">{roleLabel}</span>.
              </Text>

              <Text className="mb-4 text-base text-gray-700">
                Para aceitar o convite, faça login com este e-mail (se ainda não
                tiver conta, cadastre-se) e clique no botão abaixo.
              </Text>

              <Section className="my-8 text-center">
                <Button
                  href={inviteUrl}
                  className="box-border rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white no-underline"
                >
                  Aceitar convite
                </Button>
              </Section>

              <Text className="mb-4 text-sm text-gray-600">
                Se o botão não funcionar, copie e cole o link no navegador:
              </Text>

              <Text className="mb-6 break-all text-sm text-blue-600">
                {inviteUrl}
              </Text>

              <Text className="text-sm text-gray-600">
                Se você não esperava este convite, pode ignorar este e-mail.
              </Text>
            </Section>

            <Section className="mt-8 border-t border-gray-200 pt-6">
              <Text className="m-0 text-center text-xs text-gray-500">
                © 2026 Boilerplate. Todos os direitos reservados.
              </Text>
              <Text className="m-0 text-center text-xs text-gray-500">
                123 Rua da Empresa, São José, BR
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
