# Kam Yoga Website

A website for Kam Yoga, offering yoga classes, meditation sessions, and workshops in Ireland.

## Project Overview

This website provides information about Kam Yoga's offerings, including:
- Yoga classes (Dru Yoga)
- Meditation sessions
- Workshops
- Children's yoga
- Blog with yoga and wellness content

## Technologies

This project is built with:
- **Vite** - Build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **React Router** - Client-side routing
- **shadcn-ui** - UI component library
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

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

3. Start the development server:
```sh
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # React components
│   ├── blog/      # Blog-related components
│   ├── classes/   # Class booking components
│   ├── home/      # Home page sections
│   ├── layout/    # Header, Footer
│   └── ui/        # shadcn-ui components
├── data/          # Static data (blog posts, classes)
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── pages/         # Page components
└── main.tsx       # Application entry point
```

## Deployment

### GitHub Pages

This project is configured for GitHub Pages deployment at `/kam-yoga/`.

1. Build the project:
```sh
npm run build
```

2. Deploy the `dist` folder to GitHub Pages:
   - Go to your repository Settings > Pages
   - Set Source to "GitHub Actions" or "Deploy from a branch"
   - If using branch deployment, select the branch (e.g., `main` or `gh-pages`) and set the folder to `/dist`
   - Or use GitHub Actions to automatically deploy on push

3. The site will be available at `https://<username>.github.io/kam-yoga/`

**Note:** The app is configured with base path `/kam-yoga/`. If you change the repository name or deploy to a custom domain, update the `base` in `vite.config.ts` and `basename` in `src/App.tsx`.

### Other Static Hosting

Build the project for production:

```sh
npm run build
```

The `dist` folder will contain the production-ready files that can be deployed to any static hosting service (Vercel, Netlify, etc.).

**For root domain deployment:** Update `vite.config.ts` to set `base: "/"` and remove the `basename` prop from `BrowserRouter` in `src/App.tsx`.

## Stripe Test Mode (Bookings)

Environment variables (do not hardcode):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for Supabase Edge Functions)
- `STRIPE_SECRET_KEY` (test)
- `STRIPE_WEBHOOK_SECRET` (test)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test, for browser if needed)
- `APP_URL` (e.g. `http://localhost:5173` or deployed URL with `/kam-yoga` base if applicable)
- `ADMIN_EMAILS` or table `admin_users` (see below)

### Running Stripe CLI and webhooks locally

```
stripe login
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

Use the test card `4242 4242 4242 4242` with any future expiry, any CVC, any ZIP.

### Supabase Edge Functions

Deploy the payment functions after setting secrets in Supabase:

```
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

### Admin allowlist

Create an admin user entry (email must match Supabase Auth email):

```sql
insert into public.admin_users (email) values ('you@example.com')
on conflict (email) do nothing;
```

### Seeding demo classes

Migration `0007_stripe_payments_refresh` seeds three future classes if none exist. You can also create classes from the admin UI (`/admin/classes`).

For manual SQL seed:
```sql
insert into public.classes (title, description, starts_at, ends_at, price_cents, currency, capacity, is_active)
values
  ('Morning Flow','All-levels vinyasa', now() + interval '2 day', now() + interval '2 day' + interval '1 hour', 1800, 'eur', 14, true),
  ('Evening Yin','Deep stretches', now() + interval '4 day', now() + interval '4 day' + interval '75 minutes', 2000, 'eur', 12, true),
  ('Beginner Foundations','Basics with alignment cues', now() + interval '6 day', now() + interval '6 day' + interval '1 hour', 1500, 'eur', 20, true);
```

### Troubleshooting
- Webhook signature failed: confirm `STRIPE_WEBHOOK_SECRET` and forwarding URL match test mode.
- APP_URL mismatch: include `/kam-yoga` prefix if hosted under that path.
- Admin lists empty: ensure your email exists in `admin_users` and you are signed in; RLS blocks non-admins.
- Success page stuck pending: wait for webhook; verify Stripe CLI forwarding and whsec.
- Capacity errors: confirm class capacity and that paid bookings count uses `status='paid'`.

## License

© 2024 Kam Yoga. All rights reserved.
