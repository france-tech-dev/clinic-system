import { AppSidebar } from "@/components/templates/Sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  BillingBanner,
  shouldShowBillingBanner,
} from "@/features/billing/components/billing-banner";
import { getBillingSnapshot } from "@/domains/billing/billing.service";
import { getClinicModuleAccess } from "@/server/auth/module-access";
import { findProxyMember } from "@/server/auth/proxy-member";
import { getCurrentUser } from "@/server/auth/users";
import { getOrganizations } from "@/server/organizations/organizations";
import { BRAND_LOGO } from "@/shared/constants/brand";
import { isPlatformAdminUserId } from "@/shared/lib/platform-admin";

export default async function LayoutContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, session } = await getCurrentUser();
  const organizations = await getOrganizations();
  const activeOrganizationId = session.activeOrganizationId ?? null;
  const member = await findProxyMember(user.id, activeOrganizationId);
  const billingSnapshot = activeOrganizationId
    ? await getBillingSnapshot(activeOrganizationId)
    : null;
  const isPlatformAdmin = isPlatformAdminUserId(user.id);
  const moduleAccess = await getClinicModuleAccess(member?.role ?? null);

  const sidebarUser = {
    name: user.name ?? "Usuário",
    email: user.email ?? "",
    avatar: user.image ?? BRAND_LOGO,
    role: member?.role ?? null,
  };

  return (
    <SidebarProvider
      defaultOpen={false}
      className="h-svh! min-h-0 overflow-hidden"
    >
      <AppSidebar
        user={sidebarUser}
        organizations={organizations.map((o) => ({
          id: o.id,
          name: o.name,
        }))}
        activeOrganizationId={activeOrganizationId}
        isPlatformAdmin={isPlatformAdmin}
        moduleAccess={moduleAccess}
        variant="inset"
      />
      <SidebarInset className="min-h-0 overflow-hidden">
        <div className="flex h-full min-h-0 flex-col">
          {billingSnapshot && shouldShowBillingBanner(billingSnapshot) ? (
            <div className="px-4 pt-4 lg:px-6">
              <BillingBanner snapshot={billingSnapshot} />
            </div>
          ) : null}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
