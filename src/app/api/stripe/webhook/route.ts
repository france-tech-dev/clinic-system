import { NextResponse } from "next/server";
import { handleStripeWebhookEvent } from "@/features/billing/billing.service";
import { getStripe, getStripeWebhookSecret } from "@/shared/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = getStripeWebhookSecret();
  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "Stripe webhook não configurado." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura em falta." }, { status: 400 });
  }

  const payload = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    await handleStripeWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[billing] webhook", error);
    return NextResponse.json({ error: "Webhook inválido." }, { status: 400 });
  }
}
