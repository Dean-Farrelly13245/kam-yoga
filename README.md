# Kam Yoga Website

A professional website for Kam Yoga, offering yoga classes, meditation sessions, and workshops in Ireland.

## Project Overview

This website provides:
- Online booking system with Stripe payments (test mode)
- Yoga class scheduling and management
- User authentication (magic link email login)
- Guest booking with optional account creation
- Admin dashboard for managing classes, bookings, and blog
- Blog with yoga and wellness content
- Responsive design for mobile and desktop

## Technologies

Built with modern web technologies:
- **Vite** - Lightning-fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI library with hooks
- **React Router v6** - Client-side routing
- **Supabase** - Backend (auth, database, storage)
- **Stripe** - Payment processing
- **shadcn-ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **date-fns** - Date manipulation

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Supabase account (for backend)
- Stripe account (for payments)

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
cd kam-yoga
```

2. Install dependencies:
```sh
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```sh
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server (port 8080)
- `npm run build` - Build for production (Netlify)
- `npm run build:gh-pages` - Build for GitHub Pages deployment
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## Project Structure

```
kam-yoga/
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── blog/         # Blog-related components
│   │   ├── classes/      # Class booking components
│   │   ├── home/         # Home page sections
│   │   ├── layout/       # Header, Footer, Banners
│   │   └── ui/           # shadcn-ui components
│   ├── config/           # Configuration (site settings)
│   ├── data/             # Static data
│   ├── hooks/            # Custom React hooks (useAuth, useAdmin)
│   ├── lib/              # Utility functions & Supabase client
│   ├── pages/            # Page components & routes
│   │   └── admin/        # Admin dashboard pages
│   └── main.tsx          # Application entry point
├── supabase/
│   ├── functions/        # Edge Functions (Stripe checkout, webhook)
│   └── migrations/       # Database migrations
├── public/               # Static assets
├── docs/                 # Documentation
└── netlify.toml          # Netlify configuration
```

## Deployment

### Netlify (Recommended)

This project is optimized for Netlify deployment:

1. **Push to Git:**
   ```sh
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Netlify will auto-detect settings from `netlify.toml`

3. **Configure Environment Variables:**
   In Netlify dashboard → Site settings → Environment variables, add:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

4. **Deploy:**
   - Netlify will automatically build and deploy
   - Your site will be live at `https://your-site.netlify.app`
   - Configure custom domain in Netlify settings (optional)

**Features enabled in Netlify:**
- ✅ SPA routing (redirects to index.html)
- ✅ Security headers
- ✅ Asset caching (1 year for static files)
- ✅ Automatic HTTPS
- ✅ Continuous deployment on git push

### GitHub Pages (Alternative)

For GitHub Pages deployment:

1. Update the base path in `vite.config.ts` (already configured for `/kam-yoga/`)
2. Build for GitHub Pages:
   ```sh
   npm run build:gh-pages
   ```
3. Deploy the `dist` folder to GitHub Pages
4. Site available at `https://<username>.github.io/kam-yoga/`

**Note:** The project auto-detects environment:
- Production build → root path `/` (Netlify)
- Development build → `/kam-yoga/` path (GitHub Pages)

## Backend Setup

### Supabase

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Run Migrations:**
   ```sh
   # Install Supabase CLI
   npm install -g supabase
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Push migrations
   supabase db push
   ```

3. **Create Admin User:**
   ```sql
   INSERT INTO public.admin_users (email) 
   VALUES ('your-email@example.com')
   ON CONFLICT (email) DO NOTHING;
   ```

4. **Deploy Edge Functions:**
   ```sh
   supabase functions deploy create-checkout-session
   supabase functions deploy stripe-webhook
   ```

5. **Set Edge Function Secrets:**
   ```sh
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   supabase secrets set APP_URL=https://your-site.netlify.app
   ```

### Stripe

1. **Create Stripe Account:**
   - Go to [stripe.com](https://stripe.com)
   - Create account (use test mode)

2. **Get API Keys:**
   - Dashboard → Developers → API keys
   - Copy "Secret key" (sk_test_...)
   - Add to Supabase secrets

3. **Set Up Webhook:**
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy webhook signing secret (whsec_...)
   - Add to Supabase secrets

4. **Test Locally (Optional):**
   ```sh
   # Install Stripe CLI
   stripe login
   
   # Forward webhooks to local Supabase
   stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
   ```

**Test Card:** Use `4242 4242 4242 4242` with any future expiry, CVC, and ZIP.

## Features

### User Features
- ✅ Browse yoga classes
- ✅ Book classes as guest (no account required)
- ✅ Secure payment with Stripe
- ✅ Create account with magic link (no password)
- ✅ Auto-claim previous guest bookings
- ✅ View and manage bookings
- ✅ Cancel pending bookings
- ✅ Token-based guest booking management
- ✅ Read blog posts

### Admin Features
- ✅ Secure admin authentication
- ✅ Create and manage classes
- ✅ View all bookings
- ✅ Create and publish blog posts
- ✅ Upload blog images
- ✅ Analytics dashboard

## Environment Variables

### Frontend (`.env`)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

### Edge Functions (Supabase Secrets)
```sh
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
STRIPE_SECRET_KEY=sk_test_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...
APP_URL=https://your-site.netlify.app
```

## Troubleshooting

### Build Issues
- **Module not found:** Run `npm install`
- **TypeScript errors:** Check `tsconfig.json` and type definitions
- **Environment variables not loading:** Ensure `.env` file exists and variables start with `VITE_`

### Deployment Issues
- **404 on refresh:** Check `netlify.toml` redirects are configured
- **Environment variables missing:** Add to Netlify dashboard
- **Assets not loading:** Check base path configuration in `vite.config.ts`

### Booking/Payment Issues
- **Webhook signature failed:** Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- **Checkout redirects to wrong URL:** Update `APP_URL` in Supabase secrets
- **Success page stuck on pending:** Wait for webhook; check Stripe webhook logs
- **Cannot cancel paid booking:** This is expected; paid bookings require manual contact

### Admin Access Issues
- **Cannot access admin:** Ensure email exists in `admin_users` table
- **Blog image upload fails:** Check Supabase storage policies and `is_admin()` function
- **RLS blocks admin:** Verify `is_admin()` function checks `admin_users.email`

## Contributing

This is a private project for Kam Yoga. For issues or feature requests, please contact the development team.

## License

© 2024-2026 Kam Yoga. All rights reserved.

---

## Documentation

Additional documentation available in `docs/`:
- `OPTION2_IMPLEMENTATION.md` - Guest booking implementation details
- `FLOW_DIAGRAM.md` - User flow diagrams
- `ADMIN_SETUP.md` - Admin configuration guide
- `AUDIT_REPORT.md` - Security audit report

## Support

For technical support or questions:
1. Check troubleshooting section above
2. Review documentation in `docs/`
3. Check Supabase logs for backend errors
4. Check browser console for frontend errors
