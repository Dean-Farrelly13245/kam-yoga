// Supabase Edge Function: Create Stripe Checkout Session
// Creates a pending booking and returns Stripe Checkout URL

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  classId: string;
  name: string;
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const siteUrl = Deno.env.get("SITE_URL");

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceRoleKey || !siteUrl) {
      throw new Error("Missing required environment variables");
    }

    // Parse request body
    const body: RequestBody = await req.json();
    const { classId, name, email } = body;

    // Validate inputs
    if (!classId || !name || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: classId, name, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch the class
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("*")
      .eq("id", classId)
      .single();

    if (classError || !classData) {
      return new Response(
        JSON.stringify({ error: "Class not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate class is published
    if (!classData.is_published) {
      return new Response(
        JSON.stringify({ error: "Class is not published" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate class has price
    if (!classData.price_eur || classData.price_eur <= 0) {
      return new Response(
        JSON.stringify({ error: "Class has no valid price" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if class date/time is in the past
    const classDateTime = new Date(`${classData.date}T${classData.start_time}`);
    if (classDateTime < new Date()) {
      return new Response(
        JSON.stringify({ error: "Cannot book past classes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check capacity if set
    if (classData.capacity != null) {
      const { count, error: countError } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("class_id", classId)
        .eq("status", "paid");

      if (countError) {
        console.error("Error checking capacity:", countError);
      } else if (count !== null && count >= classData.capacity) {
        return new Response(
          JSON.stringify({ error: "Class is fully booked" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create pending booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        class_id: classId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        status: "pending",
        amount_eur: classData.price_eur,
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error("Error creating booking:", bookingError);
      return new Response(
        JSON.stringify({ error: "Failed to create booking" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Stripe Checkout Session
    // Remove trailing slashes from SITE_URL to prevent double slashes
    const baseUrl = siteUrl.replace(/\/+$/, "");
    
    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        mode: "payment",
        "line_items[0][price_data][currency]": "eur",
        "line_items[0][price_data][product_data][name]": classData.title,
        "line_items[0][price_data][product_data][description]": `${classData.date} at ${classData.start_time}${classData.location ? ` - ${classData.location}` : ""}`,
        "line_items[0][price_data][unit_amount]": String(Math.round(classData.price_eur * 100)),
        "line_items[0][quantity]": "1",
        success_url: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/booking/cancelled`,
        customer_email: email.trim().toLowerCase(),
        "metadata[booking_id]": booking.id,
        "metadata[class_id]": classId,
      }),
    });

    if (!stripeResponse.ok) {
      const stripeError = await stripeResponse.text();
      console.error("Stripe error:", stripeError);
      
      // Clean up booking on Stripe error
      await supabase.from("bookings").delete().eq("id", booking.id);
      
      return new Response(
        JSON.stringify({ error: "Failed to create payment session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeSession = await stripeResponse.json();

    // Update booking with Stripe session ID
    await supabase
      .from("bookings")
      .update({ stripe_session_id: stripeSession.id })
      .eq("id", booking.id);

    return new Response(
      JSON.stringify({ url: stripeSession.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
