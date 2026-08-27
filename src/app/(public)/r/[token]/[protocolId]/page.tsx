import { notFound } from "next/navigation";
import { InviteInstrumentForm } from "@/features/protocol/components/public/invite-instrument-form";
import { PublicInviteUnavailable } from "@/features/protocol/components/public/public-invite-unavailable";
import { getEvaluationModule } from "@/features/protocol/evaluation-modules";
import { getPublicProtocolInviteInstrument } from "@/domains/protocol/invite/protocol-invite.service";

export default async function PublicAvaliacaoInstrumentPage({
  params,
}: {
  params: Promise<{ token: string; protocolId: string }>;
}) {
  const { token, protocolId } = await params;
  const mod = getEvaluationModule(protocolId);
  if (!mod?.template || !mod.supportsPublicInvite) notFound();

  const instrument = await getPublicProtocolInviteInstrument(token, protocolId);
  if (!instrument) {
    return <PublicInviteUnavailable />;
  }

  return (
    <InviteInstrumentForm instrument={instrument} template={mod.template} />
  );
}
