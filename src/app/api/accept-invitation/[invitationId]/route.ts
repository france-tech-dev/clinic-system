import { auth } from "@/shared/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { paths } from "@/shared/constants/paths";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> },
) {
  const { invitationId } = await params;

  try {
    await auth.api.acceptInvitation({
      body: { invitationId },
      headers: await headers(),
    });

    return NextResponse.redirect(new URL(paths.root, request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL(paths.auth.login, request.url));
  }
}
