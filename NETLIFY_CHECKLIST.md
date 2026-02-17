# Netlify Deployment Checklist

Use this checklist to ensure a successful Netlify deployment.

## Pre-Deployment Checklist

### 1. Code Quality
- [x] All TypeScript errors resolved
- [x] All ESLint warnings fixed
- [x] No Lovable branding references
- [x] No hardcoded environment variables
- [ ] All tests pass (if applicable)
- [ ] Code reviewed and approved

### 2. Environment Configuration
- [x] `netlify.toml` configured
- [x] `.env.example` created with required variables
- [x] `.gitignore` includes `.env` files
- [x] Vite config supports both Netlify and GitHub Pages
- [x] App.tsx dynamically sets basename

### 3. Supabase Setup
- [ ] Supabase project created
- [ ] All migrations applied (`supabase db push`)
- [ ] Admin user created in `admin_users` table
- [ ] Edge Functions deployed:
  - [ ] `create-checkout-session`
  - [ ] `stripe-webhook`
- [ ] Edge Function secrets set:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `APP_URL` (will update after Netlify deploy)

### 4. Stripe Setup
- [ ] Stripe account created (test mode)
- [ ] Test API keys obtained
- [ ] Webhook endpoint will be created after first deploy

### 5. Repository
- [ ] All changes committed
- [ ] Changes pushed to main branch
- [ ] Repository accessible to Netlify

## Deployment Steps

### Step 1: Connect Netlify
- [ ] Sign in to Netlify
- [ ] Click "Add new site" → "Import existing project"
- [ ] Connect Git provider
- [ ] Select `kam-yoga` repository

### Step 2: Configure Build
- [ ] Verify build settings:
  - Base directory: (empty)
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Branch: `main`
- [ ] Click "Deploy site"

### Step 3: Add Environment Variables
In Netlify dashboard → Site settings → Environment variables:
- [ ] `VITE_SUPABASE_URL` = (from Supabase project settings)
- [ ] `VITE_SUPABASE_ANON_KEY` = (from Supabase API settings)

### Step 4: Deploy
- [ ] Trigger deploy (will auto-deploy after env vars added)
- [ ] Wait for build to complete
- [ ] Note the Netlify URL (e.g., `https://awesome-site-123.netlify.app`)

### Step 5: Update Supabase
Update Edge Function secret with Netlify URL:
```sh
supabase secrets set APP_URL=https://your-site.netlify.app
```
- [ ] `APP_URL` secret updated

### Step 6: Configure Stripe Webhook
- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] Enter: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- [ ] Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- [ ] Copy signing secret (whsec_...)
- [ ] Update Supabase secret:
  ```sh
  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- [ ] Redeploy Edge Functions:
  ```sh
  supabase functions deploy stripe-webhook
  ```

## Testing Checklist

### Basic Functionality
- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Images load correctly
- [ ] Footer displays correctly
- [ ] Mobile responsive design works

### Authentication
- [ ] Magic link sign-in works
- [ ] Email received with sign-in link
- [ ] Sign-in redirects to bookings page
- [ ] Sign out works

### Guest Booking
- [ ] Browse classes page loads
- [ ] Click "Book Now" opens modal
- [ ] Fill form and submit
- [ ] Redirect to Stripe checkout
- [ ] Complete payment with test card `4242 4242 4242 4242`
- [ ] Redirect to success page
- [ ] Manage link displayed
- [ ] Booking status shows as "paid" (may take 10-30 seconds)

### User Booking (After Creating Account)
- [ ] Create account with magic link
- [ ] Previous guest bookings auto-claimed
- [ ] Bookings page shows all bookings
- [ ] Book new class (email pre-filled)
- [ ] Cancel pending booking works
- [ ] Paid bookings show "contact us" message

### Guest Manage Link
- [ ] Open manage link from success page
- [ ] Booking details display correctly
- [ ] Cancel button works for pending bookings
- [ ] Error shown for paid booking cancellation
- [ ] CTA to create account displayed

### Admin Functionality
- [ ] Admin login works (`/admin/login`)
- [ ] Dashboard loads (`/admin`)
- [ ] View all bookings (`/admin/bookings`)
- [ ] Create new class (`/admin/classes`)
- [ ] Edit existing class
- [ ] Create blog post (`/admin/blog`)
- [ ] Upload blog image
- [ ] Publish blog post
- [ ] View analytics (if implemented)

### Blog
- [ ] Blog list page loads (`/blog`)
- [ ] Blog post page loads
- [ ] Images in blog posts display
- [ ] Published posts visible
- [ ] Draft posts not visible to public

## Post-Deployment

### Custom Domain (Optional)
- [ ] Add custom domain in Netlify
- [ ] Update DNS records with domain provider
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] SSL certificate auto-provisioned
- [ ] Update `APP_URL` in Supabase secrets to custom domain

### Monitoring
- [ ] Enable Netlify Analytics (optional, $9/month)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Monitor Supabase logs for errors
- [ ] Monitor Stripe webhook logs

### Performance
- [ ] Enable Netlify asset optimization:
  - [ ] Bundle CSS
  - [ ] Minify CSS
  - [ ] Minify JS
  - [ ] Compress images
- [ ] Test site speed with Lighthouse
- [ ] Test on multiple devices/browsers

### SEO (Optional)
- [ ] Add sitemap.xml
- [ ] Add robots.txt (already included in public/)
- [ ] Configure Open Graph meta tags
- [ ] Submit to Google Search Console

## Troubleshooting

### Build Fails
**Symptom:** Build fails with module errors
**Fix:** 
1. Check `package.json` dependencies
2. Run `npm install` locally to verify
3. Check build logs in Netlify

---

**Symptom:** Environment variables not found
**Fix:**
1. Verify variables added in Netlify dashboard
2. Check variable names match exactly
3. Trigger new deploy after adding variables

---

### Site Loads but Broken
**Symptom:** 404 on page refresh
**Fix:** Check `netlify.toml` has redirect rule (should be automatic)

---

**Symptom:** Images not loading
**Fix:**
1. Check images are in `public/` folder
2. Clear Netlify cache and redeploy
3. Check browser console for 404 errors

---

**Symptom:** Stripe checkout fails
**Fix:**
1. Check `APP_URL` in Supabase matches Netlify URL
2. Verify Stripe test keys are correct
3. Check Edge Function logs in Supabase

---

**Symptom:** Webhook verification fails
**Fix:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
2. Check webhook endpoint URL is correct
3. Test webhook manually in Stripe dashboard

---

**Symptom:** Admin login fails
**Fix:**
1. Verify email in `admin_users` table
2. Check `is_admin()` function exists
3. Check Supabase Auth is enabled

---

**Symptom:** Blog images won't upload
**Fix:**
1. Check Supabase Storage bucket `blog-images` exists
2. Verify storage policies allow admin upload
3. Check `is_admin()` function returns true

## Success Criteria

Deployment is successful when:
- ✅ Site loads at Netlify URL
- ✅ All pages accessible
- ✅ Guest booking flow works end-to-end
- ✅ Payment processing works
- ✅ Email magic link authentication works
- ✅ Admin dashboard accessible
- ✅ Blog posts visible
- ✅ No console errors
- ✅ Mobile responsive
- ✅ HTTPS enabled

## Rollback Plan

If deployment fails critically:

1. **Rollback to previous deploy:**
   - Go to Netlify → Deploys
   - Find last working deploy
   - Click "..." → "Publish deploy"

2. **Fix issues locally:**
   - Identify problem from logs
   - Fix code locally
   - Test locally with `npm run build && npm run preview`
   - Commit and push fix
   - Netlify auto-deploys

## Support Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- Project README: `README.md`
- Netlify Guide: `docs/NETLIFY_DEPLOYMENT.md`
- Implementation Docs: `docs/OPTION2_IMPLEMENTATION.md`

## Notes

- First deploy may take 2-5 minutes
- Subsequent deploys take 1-2 minutes
- DNS propagation can take up to 48 hours
- Stripe test mode is free (no credit card required)
- Supabase free tier includes 500MB database and 1GB bandwidth
- Netlify free tier includes 100GB bandwidth and 300 build minutes/month

---

**Date:** 2026-01-28
**Status:** Ready for Production ✅
