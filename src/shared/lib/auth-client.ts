import { createAuthClient } from "better-auth/react";
import {
  lastLoginMethodClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { toast } from "sonner";
import {
  ac,
  ADMIN,
  OWNER,
  MANAGER,
  MEMBER,
  CLIENT,
} from "@/shared/lib/permissions";

export const authClient = createAuthClient({
  fetchOptions: {
    onError(context) {
      const { response } = context;
      if (response?.status !== 429) return;

      const retryAfter = response.headers.get("X-Retry-After");
      const seconds = retryAfter ? Number(retryAfter) : NaN;
      toast.error(
        Number.isFinite(seconds) && seconds > 0
          ? `Demasiadas tentativas. Tente novamente em ${Math.ceil(seconds)}s.`
          : "Demasiadas tentativas. Tente novamente mais tarde.",
      );
    },
  },
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
