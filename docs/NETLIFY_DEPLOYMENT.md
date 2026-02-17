# Netlify Deployment Guide for Kam Yoga

This guide walks you through deploying the Kam Yoga website to Netlify.

## Prerequisites

- Netlify account (free tier works)
- Git repository (GitHub, GitLab, or Bitbucket)
- Supabase project set up with migrations applied
- Stripe account in test mode

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure all changes are committed and pushed:

```sh
git add .
git commit -m "Configure for Netlify deployment"
git push origin main
```

### 2. Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repositories
5. Select the `kam-yoga` repository

### 3. Configure Build Settings

Netlify should auto-detect the settings from `netlify.toml`, but verify:

- **Base directory:** (leave empty)
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Branch to deploy:** `main`

Click **"Deploy site"** (it will fail initially - that's OK, we need to add environment variables first)

### 4. Add Environment Variables

1. In your Netlify site dashboard, go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** and add the following:

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | From Supabase project settings |
| `VITE_SUPABASE_ANON_KEY` | `eyJxxx...` | From Supabase project settings → API |
| `NODE_VERSION` | `18` | Optional, already set in netlify.toml |

**Where to find Supabase credentials:**
- Go to your Supabase project
- Click **Settings** → **API**
- Copy **Project URL** (for `VITE_SUPABASE_URL`)
- Copy **Project API keys** → **anon/public** (for `VITE_SUPABASE_ANON_KEY`)

### 5. Deploy

1. Click **"Deploys"** in the top navigation
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for the build to complete (usually 1-3 minutes)
4. Once deployed, click on the site URL to view your live site

### 6. Configure Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `kamyoga.ie`)
4. Follow instructions to:
   - Update DNS records with your domain provider
   - Netlify will automatically provision SSL certificate
5. Wait for DNS propagation (can take up to 48 hours)

### 7. Update Supabase Edge Function URLs

Your Edge Functions need to know the production URL:

```sh
# Update APP_URL secret in Supabase
supabase secrets set APP_URL=https://your-site.netlify.app

# Or if using custom domain:
supabase secrets set APP_URL=https://kamyoga.ie
```

### 8. Update Stripe Webhook URL

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   ```
   https://your-project-ref.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (whsec_...)
7. Update Supabase secret:
   ```sh
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 9. Test Your Deployment

Visit your Netlify site and test:

- ✅ Homepage loads correctly
- ✅ Navigation works (all pages load)
- ✅ Images and assets load
- ✅ Book a class as guest
- ✅ Complete test payment with card `4242 4242 4242 4242`
- ✅ Booking success page shows manage link
- ✅ Create account with magic link
- ✅ View bookings page
- ✅ Admin login works
- ✅ Admin can create classes

## Netlify Configuration Details

The project includes `netlify.toml` which configures:

### Build Settings
- Node.js version 18
- Build command: `npm run build`
- Publish directory: `dist`

### SPA Routing
All requests redirect to `index.html` for client-side routing:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Security Headers
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Privacy
- `Permissions-Policy` - Restricts browser features

### Cache Headers
- Static assets cached for 1 year
- Images cached for 1 year
- HTML not cached (ensures fresh content)

## Continuous Deployment

Netlify automatically redeploys when you push to your main branch:

```sh
# Make changes
git add .
git commit -m "Update homepage"
git push origin main

# Netlify detects push and automatically rebuilds
```

### Build Logs

View build logs in Netlify:
1. Go to **Deploys**
2. Click on a deploy
3. View **Deploy log**

Common build issues:
- **Module not found:** Check `package.json` dependencies
- **Environment variable missing:** Add in Netlify settings
- **Build timeout:** Contact Netlify support to increase limit

## Environment-Specific Builds

The project automatically detects the environment:

### Production (Netlify)
- Base path: `/` (root)
- Environment: `production`
- Build: `npm run build`

### Development (Local)
- Base path: `/kam-yoga/` (for GitHub Pages compatibility)
- Environment: `development`
- Build: `npm run dev`

### GitHub Pages (Alternative)
- Base path: `/kam-yoga/`
- Environment: `development`
- Build: `npm run build:gh-pages`

## Troubleshooting

### Build Fails

**Issue:** `Build failed: npm ERR! Missing script: "build"`

**Solution:** Check `package.json` has:
```json
"scripts": {
  "build": "vite build"
}
```

---

**Issue:** `Error: Environment variable VITE_SUPABASE_URL is not defined`

**Solution:** Add environment variables in Netlify dashboard

---

**Issue:** `Build timeout`

**Solution:** 
1. Check for infinite loops in code
2. Optimize dependencies (remove unused)
3. Contact Netlify support for timeout increase

### Deployment Works but Site Broken

**Issue:** 404 on page refresh

**Solution:** Check `netlify.toml` has redirect rule (should be automatic)

---

**Issue:** Images not loading

**Solution:** 
1. Check images are in `public/` folder
2. Use relative paths like `/image.jpg` not `./image.jpg`
3. Clear Netlify cache: **Site settings** → **Build & deploy** → **Post processing** → **Clear cache and retry deploy**

---

**Issue:** CSS not loading

**Solution:** 
1. Check Vite build output includes CSS
2. Verify `index.html` has correct asset paths
3. Check browser console for CORS errors

### Booking/Payment Issues

**Issue:** Stripe checkout redirects to wrong URL

**Solution:** Update `APP_URL` in Supabase:
```sh
supabase secrets set APP_URL=https://your-actual-site.netlify.app
```

---

**Issue:** Webhook signature verification fails

**Solution:**
1. Get webhook secret from Stripe dashboard
2. Update Supabase secret:
   ```sh
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. Redeploy Edge Functions:
   ```sh
   supabase functions deploy stripe-webhook
   ```

---

**Issue:** Success page stuck on "pending"

**Solution:**
1. Check Stripe webhook logs for errors
2. Verify webhook endpoint URL is correct
3. Test webhook manually in Stripe dashboard
4. Check Supabase Edge Function logs

### Admin Access Issues

**Issue:** Cannot access admin dashboard

**Solution:**
1. Verify email exists in `admin_users` table:
   ```sql
   SELECT * FROM public.admin_users WHERE email = 'your@email.com';
   ```
2. If not found, add:
   ```sql
   INSERT INTO public.admin_users (email) VALUES ('your@email.com');
   ```
3. Sign out and sign in again

---

**Issue:** Blog image upload fails

**Solution:**
1. Check Supabase Storage bucket `blog-images` exists
2. Verify storage policies allow admin upload
3. Check `is_admin()` function returns true
4. Check browser console for CORS errors

## Performance Optimization

### Enable Netlify CDN
Already enabled by default - assets served from edge locations worldwide

### Enable Asset Optimization
1. Go to **Site settings** → **Build & deploy** → **Post processing**
2. Enable:
   - **Bundle CSS** - Combines CSS files
   - **Minify CSS** - Reduces CSS file size
   - **Minify JS** - Reduces JS file size
   - **Compress images** - Optimizes image sizes

### Enable Prerendering (Optional)
For better SEO, enable prerendering:
1. Install Netlify plugin:
   ```sh
   npm install -D @netlify/plugin-nextjs
   ```
2. Add to `netlify.toml`:
   ```toml
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

## Monitoring

### Analytics
Enable Netlify Analytics:
1. Go to **Analytics** tab
2. Enable Netlify Analytics ($9/month)
3. View traffic, top pages, sources

### Logs
View function logs:
1. Go to **Functions** tab
2. Click on function name
3. View logs and errors

### Uptime Monitoring
Set up external monitoring:
- [UptimeRobot](https://uptimerobot.com) - Free
- [Pingdom](https://pingdom.com) - Paid
- [StatusCake](https://statuscake.com) - Free tier

## Security

### HTTPS
Netlify automatically provisions SSL certificate (Let's Encrypt)

### Environment Variables
- Never commit `.env` files
- Only add via Netlify dashboard
- Variables are encrypted at rest

### Headers
Security headers configured in `netlify.toml`:
- Prevents clickjacking
- Prevents MIME sniffing
- Restricts browser features

### Updates
Keep dependencies updated:
```sh
npm outdated
npm update
```

## Rollback

If a deploy breaks the site:

1. Go to **Deploys**
2. Find working deploy
3. Click **"..."** → **"Publish deploy"**
4. Site reverts to previous version instantly

## Support

### Netlify Support
- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Community Forum](https://answers.netlify.com)
- [Netlify Status](https://netlifystatus.com)

### Project Support
- Check `README.md` for project-specific help
- Review `docs/` for implementation details
- Check Supabase logs for backend errors
- Check browser console for frontend errors

---

**Last Updated:** 2026-01-28
**Status:** Production Ready ✅
