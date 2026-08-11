import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { paths } from "@/shared/constants/paths";
import { auth } from "@/shared/lib/auth";
import {
  canAccessClinicPanel,
  isLeadershipRole,
} from "@/shared/lib/member-role";
import { findProxyMember } from "@/server/auth/proxy-member";

const leadershipPaths = [
  paths.painel,
  paths.caixa,
  paths.profissionais,
  paths.configuracoes,
] as const;

function isAuthRoute(pathname: string) {
  return pathname.startsWith(paths.auth.root);
}

function isOrgSetupRoute(pathname: string) {
  return pathname === paths.organizacao;
}

function isPortalRoute(pathname: string) {
  return pathname.startsWith(paths.portal);
}

function isLeadershipPath(pathname: string) {
  return leadershipPaths.some((path) => pathname === path);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  // Sem sessão: só rotas de auth; resto → login
  if (!session) {
    if (isAuthRoute(pathname)) return NextResponse.next();
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

  const member = await findProxyMember(
    session.user.id,
    session.session.activeOrganizationId,
  );

  if (member?.status === "inactive") {
    const logoutUrl = new URL(paths.auth.logout, req.url);
    logoutUrl.searchParams.set("aviso", "inactive");
    return NextResponse.redirect(logoutUrl);
  }

  const hasPanel = canAccessClinicPanel(member?.role ?? null);
  const hasMembership = member != null;

  // Logado nas páginas de auth → manda para o sítio certo
  if (isAuthRoute(pathname)) {
    if (hasPanel) {
      return NextResponse.redirect(new URL(paths.agenda, req.url));
    }
    if (hasMembership) {
      return NextResponse.redirect(new URL(paths.portal, req.url));
    }
    return NextResponse.redirect(new URL(paths.organizacao, req.url));
  }

  // Portal: qualquer autenticado com membership
  if (isPortalRoute(pathname) && hasMembership) {
    return NextResponse.next();
  }

  // Só CLIENT (sem painel): resto das rotas → portal
  if (hasMembership && !hasPanel) {
    return NextResponse.redirect(new URL(paths.portal, req.url));
  }

  // Sem membership: criar clínica
  if (!hasPanel) {
    if (!member && isOrgSetupRoute(pathname)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(
      new URL(member ? paths.auth.login : paths.organizacao, req.url),
    );
  }

  if (pathname === paths.root) {
    return NextResponse.redirect(new URL(paths.agenda, req.url));
  }

  if (isLeadershipPath(pathname) && !isLeadershipRole(member?.role ?? null)) {
    return NextResponse.redirect(new URL(paths.agenda, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!logout|api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
