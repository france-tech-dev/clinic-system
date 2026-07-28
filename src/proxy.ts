import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { paths } from "@/shared/constants/paths";
import { auth } from "@/shared/lib/auth";
import { canAccessClinicPanel } from "@/shared/lib/member-role";
import { db } from "@/shared/lib/prisma";

function isAuthRoute(pathname: string) {
  return (
    pathname === paths.auth.root || pathname.startsWith(`${paths.auth.root}/`)
  );
}

function isOrgSetupRoute(pathname: string) {
  return (
    pathname === paths.organizacao ||
    pathname.startsWith(`${paths.organizacao}/`)
  );
}

function isPortalRoute(pathname: string) {
  return pathname === paths.portal || pathname.startsWith(`${paths.portal}/`);
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

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      mustChangePassword: true,
      members: {
        select: { role: true, organizationId: true, status: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // Senha temporária: só permite /auth/alterar-senha
  if (user?.mustChangePassword) {
    if (pathname === paths.auth.changePassword) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(paths.auth.changePassword, req.url));
  }

  const activeOrgId = session.session.activeOrganizationId;
  const member =
    user?.members.find((m) => m.organizationId === activeOrgId) ??
    user?.members[0] ??
    null;

  if (member?.status === "inactive") {
    const logoutUrl = new URL(paths.auth.logout, req.url);
    logoutUrl.searchParams.set("aviso", "inactive");
    return NextResponse.redirect(logoutUrl);
  }

  const hasPanel = canAccessClinicPanel(member?.role);
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!logout|api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
