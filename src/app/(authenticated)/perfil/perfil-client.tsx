"use client";

import { OwnProfileForm } from "@/features/team/components/own-profile-form";
import type { TeamMemberDTO } from "@/domains/team/team.types";

export function PerfilClient({ initial }: { initial: TeamMemberDTO }) {
  return <OwnProfileForm initial={initial} />;
}
