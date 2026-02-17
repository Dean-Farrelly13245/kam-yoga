# Option 2 Implementation: Guest Booking + Optional Account Creation

## Overview

This implementation allows users to book classes as guests (no account required) and optionally create an account to manage all their bookings. Returning users who create/sign in with the same email automatically "claim" their previous guest bookings.

## Architecture

### Database Changes (Migration 0013)

**New Columns:**
- `bookings.user_id` - References `auth.users(id)`, nullable for guest bookings
- `bookings.manage_token` - Unique token for secure guest booking management

**New Functions:**
1. `claim_my_bookings()` - Claims guest bookings when user signs in (matches by email)
2. `get_booking_by_token(p_token)` - Retrieves booking details by manage token (guest view)
3. `cancel_booking_by_token(p_token)` - Cancels booking by manage token (guest cancel)
4. `get_my_bookings()` - Retrieves all bookings for logged-in user
5. `cancel_my_booking(p_booking_id)` - Cancels booking for logged-in user

**RLS Policies:**
- Admins: Full access to all bookings
- Authenticated users: Read/update their own bookings (where `user_id = auth.uid()`)
- Guest users: No direct table access (must use token-based RPCs)

### Frontend Components

**New Components:**
1. `MagicLinkAuth.tsx` - Email magic link authentication UI
2. `BookingManage.tsx` - Token-based guest booking management page
3. `useAuth.ts` - Custom hook for auth state management

**Updated Components:**
1. `MyBookings.tsx` - Now auth-based with auto-claim on sign-in
2. `BookingModal.tsx` - Pre-fills email for logged-in users, stores manage_token
3. `BookingSuccess.tsx` - Shows appropriate links based on auth state
4. `App.tsx` - Added `/booking/manage/:token` route

**Updated Edge Functions:**
1. `create-checkout-session/index.ts` - Sets `user_id` if authenticated, returns `manage_token`

## User Flows

### Flow 1: Guest Booking
1. User browses classes (not logged in)
2. Clicks "Book Now" → fills name, email, phone
3. Redirected to Stripe Checkout
4. On success → shown manage link with token
5. Can use token link to view/cancel that specific booking

### Flow 2: Create Account After Guest Booking
1. User completes guest booking (Flow 1)
2. Clicks "Create Account / Sign In" on success page or /bookings
3. Enters email → receives magic link
4. Clicks magic link → signed in
5. System automatically claims previous guest bookings with matching email
6. User sees all bookings in /bookings page

### Flow 3: Logged-In Booking
1. User signs in via /bookings
2. Browses classes → clicks "Book Now"
3. Email pre-filled, enters name/phone
4. Redirected to Stripe Checkout
5. On success → shown "View My Bookings" button
6. Booking automatically linked to user account

### Flow 4: Manage Bookings (Logged In)
1. User navigates to /bookings
2. Signs in if not already
3. Sees all bookings (including claimed guest bookings)
4. Can cancel pending bookings (before class starts)
5. Paid bookings show "contact us" message

### Flow 5: Guest Manage Link
1. Guest receives/saves manage link: `/booking/manage/{token}`
2. Opens link → sees booking details
3. Can cancel if pending and before class starts
4. Shown CTA to create account for easier management

## Cancellation Rules

**Allowed:**
- Pending bookings before class starts

**Not Allowed:**
- Paid bookings (must contact support)
- Any booking after class has started

**Implementation:**
- Server-side validation in `cancel_booking_by_token` and `cancel_my_booking` RPCs
- Checks `status = 'pending'` and `starts_at > now()`

## Security

**Guest Bookings:**
- No email-based lookup (prevents enumeration)
- Only token-based access (64-char random hex token)
- Token is unique per booking

**Authenticated Bookings:**
- RLS enforces `user_id = auth.uid()`
- RPCs use `SECURITY DEFINER` with proper checks
- Admin access via `is_admin()` function

**Admin Schema:**
- Uses `admin_users` table (not profiles)
- `is_admin()` checks `admin_users.email = auth.email()`
- Blog storage policies use `is_admin()`

## Files Changed/Created

### Database Migrations
- ✅ `supabase/migrations/0012_fix_admin_schema.sql` (already exists)
- ✅ `supabase/migrations/0013_booking_auth_claiming.sql` (NEW)

### Frontend Components
- ✅ `src/components/auth/MagicLinkAuth.tsx` (NEW)
- ✅ `src/hooks/useAuth.ts` (NEW)
- ✅ `src/pages/BookingManage.tsx` (NEW)
- ✅ `src/pages/MyBookings.tsx` (UPDATED - auth-based)
- ✅ `src/components/classes/BookingModal.tsx` (UPDATED - auth support)
- ✅ `src/pages/BookingSuccess.tsx` (UPDATED - manage links)
- ✅ `src/App.tsx` (UPDATED - new route)
- ✅ `src/lib/supabaseClient.ts` (UPDATED - types)

### Edge Functions
- ✅ `supabase/functions/create-checkout-session/index.ts` (UPDATED - user_id + token)

## Test Plan

### Guest Booking End-to-End
- [ ] Browse classes as guest (not logged in)
- [ ] Click "Book Now" on a class
- [ ] Fill name, email, phone
- [ ] Accept policies and submit
- [ ] Redirected to Stripe test checkout
- [ ] Complete payment with test card (4242 4242 4242 4242)
- [ ] Redirected to success page
- [ ] See "Manage This Booking" link displayed
- [ ] Copy manage link
- [ ] Verify booking status shows as "paid" (or "pending" if webhook delayed)

### Guest Manage Link
- [ ] Open manage link in browser: `/booking/manage/{token}`
- [ ] See booking details (class, date, time, status)
- [ ] If pending: see "Cancel Booking" button
- [ ] If paid: see "contact us" message
- [ ] Click cancel (if pending) → confirm cancellation
- [ ] Verify status changes to "cancelled"
- [ ] Try to cancel again → should show error or already cancelled

### Create Account After Guest Booking
- [ ] Complete guest booking (above)
- [ ] Click "Create Account / Sign In" on success page
- [ ] Enter same email used for booking
- [ ] Receive magic link email
- [ ] Click magic link → redirected to /bookings
- [ ] See notification: "We found X previous booking(s)"
- [ ] See guest booking now listed in "Your Bookings"
- [ ] Verify booking shows correct status and details

### Logged-In Booking
- [ ] Navigate to /bookings
- [ ] Sign in with magic link
- [ ] Browse classes
- [ ] Click "Book Now"
- [ ] Verify email is pre-filled
- [ ] Enter name and phone
- [ ] Complete Stripe checkout
- [ ] Redirected to success page
- [ ] Click "View My Bookings"
- [ ] See new booking in list

### Logged-In View/Cancel
- [ ] Sign in to /bookings
- [ ] See list of all bookings (past and future)
- [ ] Verify status badges (pending, paid, cancelled)
- [ ] For pending booking before class: click "Cancel Booking"
- [ ] Confirm cancellation
- [ ] Verify status updates to "cancelled"
- [ ] For paid booking: verify "contact us" message shown
- [ ] For past class: verify no cancel button

### Admin Unaffected
- [ ] Sign in as admin at /admin/login
- [ ] Navigate to /admin/dashboard
- [ ] Verify dashboard loads correctly
- [ ] Navigate to /admin/classes
- [ ] Create/edit/delete a class
- [ ] Navigate to /admin/blog
- [ ] Create new blog post
- [ ] Upload image to blog post
- [ ] Verify image upload works (blog-images bucket)
- [ ] Publish blog post
- [ ] Navigate to /admin/bookings
- [ ] Verify all bookings visible (including guest and user bookings)
- [ ] Verify `is_admin()` function works

### Edge Cases
- [ ] Try to access /booking/manage/invalid-token → see "Booking Not Found"
- [ ] Try to cancel booking after class starts → see error message
- [ ] Try to cancel paid booking → see "contact us" message
- [ ] Sign in with different email than guest booking → booking NOT claimed
- [ ] Sign in with same email as guest booking → booking IS claimed
- [ ] Sign out from /bookings → redirected to auth form
- [ ] Sign in again → bookings still visible

### RLS Security Tests (Optional - requires direct DB access)
- [ ] As anon user, try to select from bookings table → denied
- [ ] As authenticated user, try to select other user's bookings → denied
- [ ] As authenticated user, select own bookings → success
- [ ] As admin, select all bookings → success

## Environment Variables Required

No new environment variables required. Existing ones:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL` (Edge Functions)
- `SUPABASE_SERVICE_ROLE_KEY` (Edge Functions)
- `STRIPE_SECRET_KEY` (Edge Functions)
- `STRIPE_WEBHOOK_SECRET` (Edge Functions)
- `APP_URL` or `SITE_URL` (Edge Functions)

## Deployment Steps

1. **Run Migrations:**
   ```bash
   # Ensure migration 0012 is applied first (if not already)
   supabase db push
   
   # Apply migration 0013
   supabase db push
   ```

2. **Deploy Edge Functions:**
   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy stripe-webhook
   ```

3. **Build and Deploy Frontend:**
   ```bash
   npm run build
   # Deploy dist/ to hosting (GitHub Pages, etc.)
   ```

4. **Verify:**
   - Test guest booking flow
   - Test account creation and claim
   - Test admin functions still work

## Known Limitations

1. **No Refund System:** Paid bookings cannot be cancelled from UI (must contact support)
2. **No Email Notifications:** Manage links are only shown in UI (not emailed)
3. **No Profile Storage:** User profile data (name, phone) not stored separately
4. **Test Mode Only:** Stripe remains in test mode (as requested)

## Future Enhancements (Not Implemented)

1. Email notifications with manage links
2. Automatic refunds for cancellations
3. User profile storage (name, phone, preferences)
4. Booking reminders
5. Waitlist functionality
6. Multi-class packages

## Rollback Plan

If issues arise:

1. **Rollback Migration 0013:**
   ```sql
   -- Remove new columns
   ALTER TABLE public.bookings DROP COLUMN IF EXISTS user_id;
   ALTER TABLE public.bookings DROP COLUMN IF EXISTS manage_token;
   
   -- Drop new functions
   DROP FUNCTION IF EXISTS public.claim_my_bookings();
   DROP FUNCTION IF EXISTS public.get_booking_by_token(text);
   DROP FUNCTION IF EXISTS public.cancel_booking_by_token(text);
   DROP FUNCTION IF EXISTS public.get_my_bookings();
   DROP FUNCTION IF EXISTS public.cancel_my_booking(uuid);
   
   -- Restore old RLS policies (admin-only)
   DROP POLICY IF EXISTS "Users read own bookings" ON public.bookings;
   DROP POLICY IF EXISTS "Users update own bookings" ON public.bookings;
   ```

2. **Revert Frontend:**
   - Restore old MyBookings.tsx (email-based lookup)
   - Remove new routes and components
   - Redeploy

3. **Revert Edge Functions:**
   - Remove user_id and manage_token handling
   - Redeploy functions
