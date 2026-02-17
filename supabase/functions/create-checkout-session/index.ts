// Supabase Edge Function: Create Stripe Checkout Session
// Creates a pending booking for a class session and returns a Checkout URL

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@16.6.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  classId: string;
  name: string;
  email: string;
  phone?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const appUrl = (Deno.env.get("APP_URL") || Deno.env.get("SITE_URL") || "").replace(/\/+$/, "");

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceRoleKey || !appUrl) {
      throw new Error("Missing required environment variables");
    }

    const body: RequestBody = await req.json();
    const { classId, name, email, phone } = body;

    if (!classId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: classId and email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-12-18" });
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: yogaClass, error: classError } = await supabase
      .from("classes")
      .select("id,title,description,starts_at,ends_at,price_cents,currency,capacity,is_active")
      .eq("id", classId)
      .single();

    if (classError || !yogaClass) {
      return new Response(
        JSON.stringify({ error: "Class not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!yogaClass.is_active) {
      return new Response(
        JSON.stringify({ error: "Class is not active" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const now = new Date();
    const startTime = new Date(yogaClass.starts_at);
    if (startTime < now) {
      return new Response(
        JSON.stringify({ error: "Cannot book past classes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!yogaClass.price_cents || yogaClass.price_cents <= 0) {
      return new Response(
        JSON.stringify({ error: "Class has no valid price" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (yogaClass.capacity !== null) {
      const { count, error: capacityError } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("class_id", classId)
        .eq("status", "paid");

      if (capacityError) {
        console.error("Error checking capacity", capacityError);
      } else if (count !== null && yogaClass.capacity !== null && count >= yogaClass.capacity) {
        return new Response(
          JSON.stringify({ error: "Class is fully booked" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Get user_id if authenticated (from Authorization header)
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (!userError && user) {
          userId = user.id;
        }
      } catch (e) {
        // Not authenticated, continue as guest
        console.log("No valid auth token, booking as guest");
      }
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        class_id: classId,
        user_id: userId,
        user_name: name?.trim() || null,
        user_email: email.trim().toLowerCase(),
        user_phone: phone?.trim() || null,
        status: "pending",
        amount_cents: yogaClass.price_cents,
        currency: yogaClass.currency || "eur",
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error("Error creating booking", bookingError);
      return new Response(
        JSON.stringify({ error: "Failed to create booking" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const classTitle = yogaClass.title || "Yoga Class";
    const timeLabel = new Date(yogaClass.starts_at).toLocaleString("en-IE", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email.trim().toLowerCase(),
      success_url: `${appUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${appUrl}/booking/cancelled?booking_id=${booking.id}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: yogaClass.currency || "eur",
            unit_amount: yogaClass.price_cents,
            product_data: {
              name: classTitle,
              description: `${timeLabel} • In-person`,
            },
          },
        },
      ],
      metadata: {
        booking_id: booking.id,
        class_id: classId,
      },
    });

    await supabase
      .from("bookings")
      .update({ stripe_checkout_session_id: stripeSession.id })
      .eq("id", booking.id);

    return new Response(
      JSON.stringify({ 
        url: stripeSession.url,
        booking_id: booking.id,
        manage_token: booking.manage_token,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
