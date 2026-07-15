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
        select: { role: true, organizationId: true },
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
  const hasPanel = canAccessClinicPanel(member?.role);

  // Logado nas páginas de auth → manda para o sítio certo
  if (isAuthRoute(pathname)) {
    return NextResponse.redirect(
      new URL(hasPanel ? paths.agenda : paths.organizacao, req.url),
    );
  }

  // Sem membership (ou CLIENT): criar clínica ou fora
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
