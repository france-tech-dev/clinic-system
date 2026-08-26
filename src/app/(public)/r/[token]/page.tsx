import { InviteHub } from "@/features/protocol/components/public/invite-hub";
import { PublicInviteUnavailable } from "@/features/protocol/components/public/public-invite-unavailable";
import { getPublicProtocolInvite } from "@/domains/protocol/invite/protocol-invite.service";

export default async function PublicAvaliacaoHubPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getPublicProtocolInvite(token);

  if (!invite) {
    return <PublicInviteUnavailable />;
  }

  return <InviteHub invite={invite} />;
}
