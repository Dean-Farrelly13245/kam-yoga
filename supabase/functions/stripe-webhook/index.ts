// Supabase Edge Function: Stripe Webhook Handler
// Confirms payments and enforces capacity using a database function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@16.6.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeWebhookSecret || !stripeSecretKey || !supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing required environment variables");
    }

    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-12-18" });
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        stripeWebhookSecret,
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed", err.message);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Idempotency: ignore already-processed events
    const { data: existingEvent } = await supabase
      .from("payments")
      .select("id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (existingEvent) {
      return new Response(
        JSON.stringify({ received: true, duplicate: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const confirmPayment = async (
      bookingId: string | null | undefined,
      checkoutSessionId: string | null,
      paymentIntentId: string | null,
      amountCents: number | null,
      currency: string | null,
      status: "succeeded" | "failed" | "refunded",
    ) => {
      if (!bookingId) return;
      const { error } = await supabase.rpc("confirm_booking_payment", {
        p_booking_id: bookingId,
        p_checkout_session_id: checkoutSessionId,
        p_payment_intent_id: paymentIntentId,
        p_amount_cents: amountCents ?? 0,
        p_currency: currency ?? "eur",
        p_payment_status: status,
        p_event_id: event.id,
      });

      if (error) {
        console.error("confirm_booking_payment error", error);
      }
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;
        await confirmPayment(
          bookingId,
          session.id,
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
          session.amount_total ?? session.amount_subtotal ?? 0,
          session.currency ?? "eur",
          "succeeded",
        );
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata?.booking_id || pi.metadata?.bookingId;
        await confirmPayment(
          bookingId,
          (pi.latest_charge as Stripe.Charge | null)?.checkout_session ?? null,
          pi.id,
          pi.amount_received ?? pi.amount ?? 0,
          pi.currency ?? "eur",
          "succeeded",
        );
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata?.booking_id || pi.metadata?.bookingId;
        await confirmPayment(
          bookingId,
          (pi.latest_charge as Stripe.Charge | null)?.checkout_session ?? null,
          pi.id,
          pi.amount ?? 0,
          pi.currency ?? "eur",
          "failed",
        );
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const bookingId = charge.metadata?.booking_id;
        await confirmPayment(
          bookingId,
          charge.checkout_session ?? null,
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id ?? null,
          charge.amount_refunded ?? charge.amount ?? 0,
          charge.currency ?? "eur",
          "refunded",
        );
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
