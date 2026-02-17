# 🚀 Quick Start: Deploy Kam Yoga to Netlify

**Goal:** Get Kam Yoga live on Netlify in under 15 minutes.

---

## Prerequisites (5 minutes)

1. **Supabase Account:**
   - Sign up at https://supabase.com (free)
   - Create new project
   - Wait for database to provision (~2 minutes)

2. **Stripe Account:**
   - Sign up at https://stripe.com (free, no credit card for test mode)
   - Stay in test mode

3. **Netlify Account:**
   - Sign up at https://netlify.com (free)
   - Connect GitHub account

---

## Step 1: Supabase Setup (3 minutes)

### Apply Migrations
```sh
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

### Create Admin User
Run this SQL in Supabase SQL Editor:
```sql
INSERT INTO public.admin_users (email) 
VALUES ('your-email@example.com')
ON CONFLICT (email) DO NOTHING;
```

### Get Credentials
1. Go to Supabase Dashboard → Settings → API
2. Copy these values (you'll need them for Netlify):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

---

## Step 2: Deploy Edge Functions (2 minutes)

### Deploy Functions
```sh
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

### Set Secrets (temporary values, will update after Netlify)
```sh
supabase secrets set STRIPE_SECRET_KEY=sk_test_51xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set APP_URL=https://placeholder.com
```

---

## Step 3: Push to Git (1 minute)

```sh
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

---

## Step 4: Deploy to Netlify (3 minutes)

### Connect Repository
1. Go to https://netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub**
4. Select `kam-yoga` repository
5. Netlify auto-detects settings ✅
6. Click **"Deploy site"** (will fail - that's OK, need env vars first)

### Add Environment Variables
1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**

Add these two variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJxxx...` |

3. Click **"Save"**

### Deploy Again
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for build (~2 minutes)
4. **Copy your site URL** (e.g., `https://awesome-site-123.netlify.app`)

---

## Step 5: Update Supabase (1 minute)

Update the APP_URL with your real Netlify URL:
```sh
supabase secrets set APP_URL=https://your-actual-site.netlify.app
```

---

## Step 6: Configure Stripe Webhook (2 minutes)

### Get Stripe Keys
1. Go to Stripe Dashboard → **Developers** → **API keys**
2. Copy **Secret key** (starts with `sk_test_`)
3. Update Supabase:
   ```sh
   supabase secrets set STRIPE_SECRET_KEY=sk_test_51xxx
   ```

### Create Webhook
1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL:**
   ```
   https://YOUR-PROJECT-REF.supabase.co/functions/v1/stripe-webhook
   ```
   (Replace `YOUR-PROJECT-REF` with your actual Supabase project ref)
4. **Events to send:** Select these 4 events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click **"Add endpoint"**
6. **Copy the Signing secret** (starts with `whsec_`)
7. Update Supabase:
   ```sh
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

### Redeploy Webhook Function
```sh
supabase functions deploy stripe-webhook
```

---

## Step 7: Test Your Site! (3 minutes)

Visit your Netlify URL and test:

### Test Guest Booking
1. Navigate to **Classes** page
2. Click **"Book Now"** on any class
3. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Phone: `123-456-7890`
4. Accept policies and click **"Confirm Booking"**
5. Use test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
6. Complete payment
7. Should redirect to success page ✅
8. Copy the **manage link** displayed

### Test Manage Link
1. Open the manage link
2. Should show booking details ✅
3. If booking is pending, try cancelling it

### Test Account Creation
1. Navigate to **/bookings**
2. Enter email and click **"Send magic link"**
3. Check email for sign-in link
4. Click link → should redirect to bookings page ✅
5. Should see your previous booking claimed

### Test Admin
1. Navigate to **/admin/login**
2. Sign in with your admin email (magic link)
3. Should redirect to admin dashboard ✅
4. Try creating a new class
5. Try viewing bookings

---

## You're Live! 🎉

Your site is now live at: `https://your-site.netlify.app`

---

## Optional: Custom Domain

### Add Custom Domain
1. In Netlify: **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `kamyoga.ie`)
4. Update DNS with your domain provider:
   - Add A record: `75.2.60.5`
   - Add CNAME: `www` → `your-site.netlify.app`
5. Wait for DNS propagation (up to 48 hours)
6. SSL certificate auto-provisions ✅

### Update Supabase APP_URL
```sh
supabase secrets set APP_URL=https://kamyoga.ie
```

---

## Common Issues

### Build Fails
- **Check:** Environment variables added in Netlify?
- **Fix:** Add them in Site settings → Environment variables

### Booking Success Page Shows Pending Forever
- **Check:** Stripe webhook configured?
- **Fix:** 
  1. Check webhook URL in Stripe
  2. Verify signing secret in Supabase
  3. Test webhook in Stripe dashboard

### Can't Access Admin Dashboard
- **Check:** Email in `admin_users` table?
- **Fix:** 
  ```sql
  INSERT INTO public.admin_users (email) VALUES ('your@email.com');
  ```

### Images Not Loading
- **Check:** Cleared Netlify cache?
- **Fix:** Site settings → Build & deploy → Clear cache and redeploy

---

## Next Steps

- ✅ Site is live and functional
- ⏭️ Add more classes in admin dashboard
- ⏭️ Create blog posts
- ⏭️ Invite users to book classes
- ⏭️ Monitor in Netlify dashboard

---

## Support

Need help?
- Check `README.md` for detailed docs
- Check `docs/NETLIFY_DEPLOYMENT.md` for troubleshooting
- Check Supabase logs for backend errors
- Check browser console for frontend errors

---

**Estimated Total Time:** 10-15 minutes  
**Difficulty:** Easy  
**Status:** Production Ready ✅

---

**Tips:**
- Use Stripe test mode (free, no charges)
- Test thoroughly before going live
- Keep secrets secure (never commit to git)
- Monitor logs for errors
