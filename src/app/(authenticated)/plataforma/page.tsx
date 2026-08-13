import { redirect } from "next/navigation";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { PlataformaClient } from "./plataforma-client";
import { paths } from "@/shared/constants/paths";
import { isPlatformAdminUserId } from "@/shared/lib/platform-admin";
import { getCurrentUser } from "@/server/auth/users";
import { listPlatformOrganizations } from "@/server/platform/platform-organizations";

export default async function PlataformaPage() {
  const { user } = await getCurrentUser();
  if (!isPlatformAdminUserId(user.id)) {
    redirect(paths.agenda);
  }

  const organizations = await listPlatformOrganizations();

  return (
    <AppPage title="Plataforma">
      <div className="flex max-w-3xl flex-col gap-2">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">
          Administração da plataforma
        </h2>
        <p className="text-sm text-muted-foreground">
          Marque clínicas a dedo para acesso completo sem cobrança. O billing
          Stripe (se existir) fica ignorado enquanto a isenção estiver activa.
        </p>
      </div>
      <div className="max-w-3xl">
        <PlataformaClient
          organizations={organizations.map((row) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            createdAt: row.createdAt.toISOString(),
            billingExempt: row.billingExempt,
            billingStatus: row.billingStatus,
            billingPlan: row.billingPlan,
            trialEndsAt: row.trialEndsAt?.toISOString() ?? null,
          }))}
        />
      </div>
    </AppPage>
  );
}
