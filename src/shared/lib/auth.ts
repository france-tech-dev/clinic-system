import { betterAuth, User } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { lastLoginMethod, magicLink, organization } from "better-auth/plugins";
import { db } from "@/shared/lib/prisma";
import { nextCookies } from "better-auth/next-js";
import {
  ac,
  ADMIN,
  OWNER,
  MANAGER,
  MEMBER,
  CLIENT,
} from "@/shared/lib/permissions";
import { OrganizationInvitationEmail } from "@/components/emails/organization-invitation";
import { ResetPasswordEmail } from "@/components/emails/reset-password";
import { VerifyEmail } from "@/components/emails/verify-email";
import { sendEmail } from "@/shared/lib/email";
import { getActiveOrganization } from "@/server/organizations/active-organization";
import { paths } from "@/shared/constants/paths";
import { Role } from "../../../prisma/generated/prisma/enums";

const baseUrl = process.env.BETTER_AUTH_URL as string;
const invitationAcceptUrl = (invitationId: string) =>
  `${baseUrl}${paths.api.acceptInvitation(invitationId)}`;

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  trustedOrigins: [baseUrl],

  // Defaults do Better Auth para endpoints sensíveis (sign-in, reset, etc.).
  // Storage em DB para partilhar contadores entre réplicas Docker.
  // ipAddress: configurar quando o proxy de produção estiver definido.
  rateLimit: {
    storage: "database",
    customRules: {
      "/get-session": false,
    },
  },

  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      birthDate: {
        type: "date",
        required: false,
      },
      mustChangePassword: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 3,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const organization = await getActiveOrganization(session.userId);
          return {
            data: {
              ...session,
              activeOrganizationId: organization?.id,
            },
          };
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Redefina sua senha",
        react: ResetPasswordEmail({
          userName: user.name,
          resetUrl: url,
        }),
      });
    },
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    async sendVerificationEmail({ user, url }: { user: User; url: string }) {
      await sendEmail({
        to: user.email,
        subject: "Verifique seu email",
        react: VerifyEmail({
          userName: user.name,
          verificationUrl: url,
        }),
      });
    },
  },

  plugins: [
    lastLoginMethod(),
    nextCookies(),
    magicLink({
      async sendMagicLink({ email, url }) {
        await sendEmail({
          to: email,
          subject: "Seu link de acesso",
          react: VerifyEmail({
            userName: email,
            verificationUrl: url,
          }),
        });
      },
    }),
    organization({
      ac,
      roles: {
        ADMIN,
        OWNER,
        MANAGER,
        MEMBER,
        CLIENT,
      },
      allowUserToCreateOrganization: true,
      creatorRole: Role.OWNER,
      async sendInvitationEmail(data) {
        const inviteUrl = invitationAcceptUrl(data.id);
        await sendEmail({
          to: data.email,
          subject: `Convite para a clínica ${data.organization.name}`,
          react: OrganizationInvitationEmail({
            inviteUrl,
            inviterName: data.inviter.user.name,
            inviterEmail: data.inviter.user.email,
            organizationName: data.organization.name,
            role: data.role,
          }),
        });
      },
    }),
  ],
});
