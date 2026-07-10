import "next-auth";

declare module "next-auth" {
  interface Session {
    session_token?: string;
  }

  interface JWT {
    session_token?: string;
    refresh_token?: string;
    expires_at?: number;
  }
}
