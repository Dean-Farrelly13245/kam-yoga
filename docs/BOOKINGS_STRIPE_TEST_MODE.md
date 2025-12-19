# Bookings & Stripe Integration - Test Mode Setup Guide

This guide covers setting up the booking and payment system using Stripe in TEST mode for the Kam Yoga site.

## Overview

The booking system uses:
- **Supabase Edge Functions** for server-side payment processing
- **Stripe Checkout** for payment collection
- **Supabase database** as the source of truth for bookings
- **Webhook-based confirmation** (webhook is the source of truth, not the success page)

## Prerequisites

1. Supabase project with `bookings` table and RLS policies already set up
2. Stripe account (test mode)
3. Supabase CLI installed (for deploying functions)

## Step 1: Get Stripe Test Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Make sure you're in **Test mode** (toggle in the top right)
3. Copy your **Publishable key** (starts with `pk_test_`) - you won't need this for now
4. Copy your **Secret key** (starts with `sk_test_`) - you'll need this
5. Go to **Developers → Webhooks** and create a new webhook endpoint (see Step 3)

## Step 2: Set Supabase Function Secrets

You need to set environment variables (secrets) for your Supabase Edge Functions:

1. Go to your Supabase Dashboard
2. Navigate to **Project Settings → Edge Functions → Secrets**
3. Add the following secrets:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SITE_URL=https://your-username.github.io/kam-yoga
```

**Important Notes:**
- `STRIPE_SECRET_KEY`: Your Stripe test secret key (starts with `sk_test_`)
- `STRIPE_WEBHOOK_SECRET`: The webhook signing secret from Stripe (starts with `whsec_`) - see Step 3
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Found in **Project Settings → API → service_role key** (keep this secret!)
- `SITE_URL`: Your deployed site URL (GitHub Pages or other hosting)

## Step 3: Configure Stripe Webhook

1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://your-project.supabase.co/functions/v1/stripe-webhook
   ```
   Replace `your-project` with your actual Supabase project reference
4. Select events to listen to:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.refunded`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) - this is your `STRIPE_WEBHOOK_SECRET`

## Step 4: Deploy Supabase Edge Functions

### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI if you haven't:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Deploy the functions:
   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy stripe-webhook
   ```

### Option B: Using Supabase Dashboard

1. Go to **Edge Functions** in your Supabase Dashboard
2. Click **Create a new function**
3. For each function:
   - Name: `create-checkout-session` or `stripe-webhook`
   - Copy the contents from `supabase/functions/[function-name]/index.ts`
   - Deploy

## Step 5: Test the Integration

### Test Card Numbers

Use these Stripe test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

For all test cards:
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

### Test Booking Checklist

1. ✅ **Create a class** in admin with:
   - `is_published = true`
   - `price_eur > 0`
   - Future date/time
   - Optional: Set `capacity` to test capacity limits

2. ✅ **Go to public Classes page** (`/classes`)

3. ✅ **Click "Book Now"** on a class

4. ✅ **Fill in booking form**:
   - Name: Any name
   - Email: Any email (e.g., `test@example.com`)

5. ✅ **Complete Stripe Checkout**:
   - Use test card `4242 4242 4242 4242`
   - Complete payment

6. ✅ **Verify booking**:
   - Should redirect to `/booking/success`
   - Check Supabase `bookings` table:
     - Status should be `pending` initially
     - After webhook processes (usually within seconds), status should be `paid`
     - `paid_at` should be set
     - `stripe_payment_intent_id` should be populated

7. ✅ **Check admin dashboard**:
   - Go to `/admin/classes`
   - Expand class details
   - Should see booking in attendee list
   - Revenue should be updated

8. ✅ **Test capacity limit**:
   - Set class `capacity = 1`
   - Book one spot
   - Try to book another - should show "Class is fully booked"

9. ✅ **Test expired session**:
   - Create a booking (don't complete payment)
   - Wait for Stripe session to expire (or manually expire in Stripe Dashboard)
   - Webhook should mark booking as `expired`

## Step 6: Local Webhook Testing (Optional)

For local development, you can use Stripe CLI to forward webhooks to your local server:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli

2. Login:
   ```bash
   stripe login
   ```

3. Forward webhooks to your deployed Supabase function:
   ```bash
   stripe listen --forward-to https://your-project.supabase.co/functions/v1/stripe-webhook
   ```

4. Or forward to local Supabase (if running locally):
   ```bash
   stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
   ```

5. The CLI will show a webhook signing secret - use this as `STRIPE_WEBHOOK_SECRET` for local testing

## Troubleshooting

### Booking stays in "pending" status

- **Check webhook**: Go to Stripe Dashboard → Developers → Webhooks → Your endpoint → View logs
- **Verify webhook secret**: Make sure `STRIPE_WEBHOOK_SECRET` matches the one from Stripe
- **Check function logs**: In Supabase Dashboard → Edge Functions → View logs

### "Class not found" error

- Verify the class exists in Supabase
- Check that `is_published = true`
- Ensure class date/time is in the future

### "Class is fully booked" when it shouldn't be

- Check capacity setting in class
- Verify paid bookings count (only `status = 'paid'` counts toward capacity)
- Check for expired/pending bookings that might be blocking spots

### Webhook signature verification fails

- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- Make sure you're using the webhook secret from the correct Stripe environment (test vs live)
- Check that the webhook endpoint URL matches exactly

### Function deployment fails

- Verify all secrets are set in Supabase Dashboard
- Check function code for syntax errors
- Ensure Deno-compatible imports are used

## Security Reminders

- ✅ **Never commit** Stripe secret keys or service role keys to git
- ✅ **Never expose** service role keys in frontend code
- ✅ **Always use** webhook for payment confirmation (not the success page)
- ✅ **Test in test mode** before going live
- ✅ **Verify RLS policies** prevent public from reading bookings

## Going Live

When ready to go live:

1. Switch Stripe to **Live mode**
2. Get live keys from Stripe Dashboard
3. Update Supabase function secrets with live keys
4. Create a new webhook endpoint for live mode
5. Update `SITE_URL` to production URL
6. Redeploy functions
7. Test with a small real transaction first

## Support

For issues:
- Check Supabase Edge Function logs
- Check Stripe webhook logs
- Verify all environment variables are set correctly
- Ensure RLS policies allow necessary operations
