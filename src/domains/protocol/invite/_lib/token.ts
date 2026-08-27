import { randomBytes } from "node:crypto";

/** Token URL-safe (~43 chars) para links públicos `/r/{token}`. */
export function createProtocolInviteToken(): string {
  return randomBytes(32).toString("base64url");
}
