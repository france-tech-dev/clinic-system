import { createAuthClient } from "better-auth/react";
import {
  lastLoginMethodClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import {
  ac,
  ADMIN,
  OWNER,
  MANAGER,
  MEMBER,
  CLIENT,
} from "@/shared/lib/permissions";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      ac,
      roles: {
        ADMIN,
        OWNER,
        MANAGER,
        MEMBER,
        CLIENT,
      },
    }),
    lastLoginMethodClient(),
    magicLinkClient(),
  ],
});

export const { signIn, signUp, signOut, useSession, organization } = authClient;
