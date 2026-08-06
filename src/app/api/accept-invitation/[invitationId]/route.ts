import { auth } from "@/shared/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { paths } from "@/shared/constants/paths";
import { assertRateLimit, getRequestClientIp } from "@/shared/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> },
) {
  const { invitationId } = await params;
  const requestHeaders = await headers();
  const ip = getRequestClientIp(requestHeaders);

  const limit = await assertRateLimit({
    key: `accept-invitation:${ip}`,
    windowSec: 60,
    max: 10,
  });

  if (!limit.ok) {
    return NextResponse.redirect(
      new URL(
        `${paths.auth.login}?error=rate_limited&retry=${limit.retryAfterSec}`,
        request.url,
      ),
    );
  }

  try {
    await auth.api.acceptInvitation({
      body: { invitationId },
      headers: requestHeaders,
    });

    return NextResponse.redirect(new URL(paths.root, request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL(paths.auth.login, request.url));
  }
}
