import { createAuthClient } from "better-auth/react";
import {
  lastLoginMethodClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [organizationClient(), lastLoginMethodClient(), magicLinkClient()],
});

export const { signIn, signUp, signOut, useSession, organization } = authClient;
