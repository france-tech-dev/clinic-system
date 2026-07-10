import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { paths } from "@/shared/constants/paths";
import { auth } from "@/shared/lib/auth";
import { db } from "@/shared/lib/prisma";
import { Role } from "../prisma/generated/prisma/enums";

function isAuthRoute(pathname: string) {
  return (
    pathname === paths.auth.root || pathname.startsWith(`${paths.auth.root}/`)
  );
}

function canAccessPanel(role: Role) {
  return role === Role.OWNER || role === Role.MEMBER || role === Role.MANAGER;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (isAuthRoute(pathname)) {
    if (!session) {
      return NextResponse.next();
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user && canAccessPanel(user.role)) {
      return NextResponse.redirect(new URL(paths.painel, req.url));
    }

    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL(paths.auth.login, req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || !canAccessPanel(user.role)) {
    return NextResponse.redirect(new URL(paths.auth.login, req.url));
  }

  if (pathname === paths.root || pathname === "/dashboard") {
    return NextResponse.redirect(new URL(paths.painel, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!logout|api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
