import { findProxyMember } from "@/server/auth/proxy-member";
import { paths } from "@/shared/constants/paths";
import { auth } from "@/shared/lib/auth";
import {
  canAccessClinicPanel,
  isLeadershipRole,
} from "@/shared/lib/member-role";
import { isPlatformAdminUserId } from "@/shared/lib/platform-admin";
import { MemberStatus } from "@prisma/enums";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const leadershipPathPermissions: Record<string, Record<string, string[]>> = {
  [paths.dashboard]: { finance: ["read"] },
  [paths.caixa]: { finance: ["read"] },
  [paths.profissionais]: { team: ["read"] },
  [paths.configuracoes]: { settings: ["read"] },
  [paths.planos]: { settings: ["read"] },
};

function isAuthRoute(pathname: string) {
  return pathname.startsWith(paths.auth.root);
}

function isPublicAvaliacaoRoute(pathname: string) {
  return (
    pathname === paths.avaliacaoPublica.root ||
    pathname.startsWith(`${paths.avaliacaoPublica.root}/`)
  );
}

function isMarketingHome(pathname: string) {
  return pathname === paths.root;
}

function isOrgSetupRoute(pathname: string) {
  return pathname === paths.organizacao;
}

function isPortalRoute(pathname: string) {
  return pathname.startsWith(paths.portal);
}

function isPlatformRoute(pathname: string) {
  return pathname.startsWith(paths.plataforma);
}

function leadershipPermissionFor(pathname: string) {
  return leadershipPathPermissions[pathname] ?? null;
}

async function canAccessLeadershipPath(
  req: NextRequest,
  pathname: string,
  role: string | null,
): Promise<boolean> {
  if (isLeadershipRole(role)) return true;
  const permissions = leadershipPermissionFor(pathname);
  if (!permissions) return false;
  try {
    const result = await auth.api.hasPermission({
      headers: req.headers,
      body: { permissions },
    });
    return result.success === true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    if (
      isAuthRoute(pathname) ||
      isPublicAvaliacaoRoute(pathname) ||
      isMarketingHome(pathname)
    ) {
      return NextResponse.next();
    }
    const loginUrl = new URL(paths.auth.login, req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.user.mustChangePassword) {
    if (pathname === paths.auth.changePassword) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(paths.auth.changePassword, req.url));
  }

  if (isPlatformRoute(pathname)) {
    if (!isPlatformAdminUserId(session.user.id)) {
      return NextResponse.redirect(new URL(paths.agenda, req.url));
    }
    return NextResponse.next();
  }

  if (isMarketingHome(pathname) || isPublicAvaliacaoRoute(pathname)) {
    return NextResponse.next();
  }

  const member = await findProxyMember(
    session.user.id,
    session.session.activeOrganizationId,
  );

  if (member?.status === MemberStatus.INACTIVE) {
    const logoutUrl = new URL(paths.auth.logout, req.url);
    logoutUrl.searchParams.set("aviso", "inactive");
    return NextResponse.redirect(logoutUrl);
  }

  const hasPanel = canAccessClinicPanel(member?.role ?? null);
  const hasMembership = member != null;

  if (isAuthRoute(pathname)) {
    if (hasPanel) {
      return NextResponse.redirect(new URL(paths.agenda, req.url));
    }
    if (hasMembership) {
      return NextResponse.redirect(new URL(paths.portal, req.url));
    }
    return NextResponse.redirect(new URL(paths.organizacao, req.url));
  }

  if (isPortalRoute(pathname) && hasMembership) {
    return NextResponse.next();
  }

  if (hasMembership && !hasPanel) {
    return NextResponse.redirect(new URL(paths.portal, req.url));
  }

  if (!hasPanel) {
    if (!member && isOrgSetupRoute(pathname)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(
      new URL(member ? paths.auth.login : paths.organizacao, req.url),
    );
  }

  if (
    leadershipPermissionFor(pathname) &&
    !(await canAccessLeadershipPath(req, pathname, member?.role ?? null))
  ) {
    return NextResponse.redirect(new URL(paths.agenda, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!logout|api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
