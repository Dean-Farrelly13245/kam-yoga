// Supabase Edge Function: Stripe Webhook Handler
// Handles Stripe webhook events to update booking status

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeWebhookSecret || !supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing required environment variables");
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify webhook signature using HMAC SHA256
    // Stripe sends signatures in format: t=timestamp,v1=signature (hex)
    const elements = signature.split(",");
    let timestamp = "";
    let v1Signature = "";
    
    for (const element of elements) {
      const [key, value] = element.split("=");
      if (key === "t") {
        timestamp = value;
      } else if (key === "v1") {
        v1Signature = value;
      }
    }

    if (!timestamp || !v1Signature) {
      return new Response(
        JSON.stringify({ error: "Invalid signature format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate timestamp and check tolerance (prevent replay attacks)
    const toleranceSeconds = 300; // 5 minutes
    const ts = Number(timestamp);
    if (!Number.isFinite(ts)) {
      return new Response(
        JSON.stringify({ error: "Invalid timestamp" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - ts) > toleranceSeconds) {
      return new Response(
        JSON.stringify({ error: "Signature timestamp outside tolerance" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create signed payload: timestamp + raw body
    const signedPayload = `${timestamp}.${rawBody}`;
    
    // Import webhook secret as crypto key
    const keyData = new TextEncoder().encode(stripeWebhookSecret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Generate expected signature (HMAC SHA256)
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      new TextEncoder().encode(signedPayload)
    );

    // Convert ArrayBuffer -> hex (Stripe uses hex)
    const expectedHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Timing-safe-ish compare (length check + no early return)
    if (expectedHex.length !== v1Signature.length) {
      console.error("Webhook signature length mismatch");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let mismatch = 0;
    for (let i = 0; i < expectedHex.length; i++) {
      mismatch |= expectedHex.charCodeAt(i) ^ v1Signature.charCodeAt(i);
    }
    if (mismatch !== 0) {
      console.error("Webhook signature verification failed");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse webhook event
    const event = JSON.parse(rawBody);

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const bookingId = session.metadata?.booking_id;

        if (!bookingId) {
          console.error("No booking_id in session metadata");
          break;
        }

        // Update booking to paid
        const { error } = await supabase
          .from("bookings")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id: session.payment_intent || null,
          })
          .eq("id", bookingId)
          .eq("status", "pending"); // Only update if still pending

        if (error) {
          console.error("Error updating booking to paid:", error);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const bookingId = session.metadata?.booking_id;

        if (!bookingId) {
          console.error("No booking_id in session metadata");
          break;
        }

        // Update booking to expired if still pending
        const { error } = await supabase
          .from("bookings")
          .update({ status: "expired" })
          .eq("id", bookingId)
          .eq("status", "pending");

        if (error) {
          console.error("Error updating booking to expired:", error);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;

        if (!paymentIntentId) {
          break;
        }

        // Find booking by payment intent and mark as refunded
        const { error } = await supabase
          .from("bookings")
          .update({ status: "refunded" })
          .eq("stripe_payment_intent_id", paymentIntentId)
          .eq("status", "paid"); // Only update paid bookings

        if (error) {
          console.error("Error updating booking to refunded:", error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
