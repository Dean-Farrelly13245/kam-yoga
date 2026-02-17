# Deployment Checklist - Option 2 Implementation

## Pre-Deployment Verification

### 1. Code Review
- [x] All TypeScript files compile without errors
- [x] No linter errors in new/modified files
- [x] All imports are correct
- [x] Types are properly defined

### 2. Database Migration Review
- [x] Migration 0012 exists (admin schema fix)
- [x] Migration 0013 created (booking auth + claiming)
- [x] Migration is idempotent (safe to re-run)
- [x] RLS policies are correct
- [x] Functions have proper SECURITY DEFINER

### 3. Edge Functions Review
- [x] create-checkout-session updated to handle user_id
- [x] create-checkout-session returns manage_token
- [x] Auth token properly extracted from headers
- [x] Error handling in place

## Deployment Steps

### Step 1: Backup Database
```bash
# Create a backup before applying migrations
supabase db dump -f backup_before_option2.sql
```

### Step 2: Apply Migrations
```bash
# Navigate to project directory
cd c:\Users\Administrator\Desktop\kam-yoga

# Apply migrations (will run 0012 and 0013 if not already applied)
supabase db push

# Verify migrations applied
supabase db remote list
```

**Expected Output:**
- Migration 0012_fix_admin_schema.sql ✓
- Migration 0013_booking_auth_claiming.sql ✓

### Step 3: Verify Database Changes
```sql
-- Check new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('user_id', 'manage_token');

-- Check new functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'claim_my_bookings',
  'get_booking_by_token',
  'cancel_booking_by_token',
  'get_my_bookings',
  'cancel_my_booking'
);

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'bookings';
```

### Step 4: Deploy Edge Functions
```bash
# Deploy updated create-checkout-session function
supabase functions deploy create-checkout-session

# Verify deployment
supabase functions list
```

### Step 5: Build Frontend
```bash
# Install dependencies (if needed)
npm install

# Build production bundle
npm run build

# Verify build output
ls dist/
```

### Step 6: Deploy Frontend
```bash
# For GitHub Pages (example)
git add .
git commit -m "feat: implement Option 2 - guest booking with optional account"
git push origin main

# Or deploy dist/ to your hosting provider
```

### Step 7: Verify Environment Variables
Ensure these are set in your hosting environment:
- ✅ VITE_SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY

Ensure these are set in Supabase Edge Functions:
- ✅ SUPABASE_URL
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ STRIPE_SECRET_KEY
- ✅ STRIPE_WEBHOOK_SECRET
- ✅ APP_URL (or SITE_URL)

## Post-Deployment Testing

### Test 1: Guest Booking (5 min)
1. [ ] Open site in incognito window
2. [ ] Navigate to /classes
3. [ ] Click "Book Now" on a class
4. [ ] Fill name, email, phone
5. [ ] Complete Stripe test checkout (4242 4242 4242 4242)
6. [ ] Verify success page shows manage link
7. [ ] Copy manage link for next test

### Test 2: Guest Manage Link (3 min)
1. [ ] Open manage link from Test 1
2. [ ] Verify booking details display correctly
3. [ ] If pending: click "Cancel Booking" and confirm
4. [ ] Verify status updates to "cancelled"

### Test 3: Account Creation & Claim (5 min)
1. [ ] Create new guest booking (repeat Test 1)
2. [ ] On success page, click "Create Account"
3. [ ] Enter same email used for booking
4. [ ] Check email for magic link
5. [ ] Click magic link
6. [ ] Verify redirected to /bookings
7. [ ] Verify notification shows "found X previous booking(s)"
8. [ ] Verify booking appears in list

### Test 4: Logged-In Booking (5 min)
1. [ ] Sign in at /bookings
2. [ ] Navigate to /classes
3. [ ] Book a class
4. [ ] Verify email is pre-filled
5. [ ] Complete checkout
6. [ ] Click "View My Bookings"
7. [ ] Verify new booking appears

### Test 5: Admin Functions (5 min)
1. [ ] Sign in at /admin/login
2. [ ] Navigate to /admin/dashboard - verify loads
3. [ ] Navigate to /admin/classes - verify can create/edit
4. [ ] Navigate to /admin/blog - verify can create post
5. [ ] Upload image to blog post - verify works
6. [ ] Navigate to /admin/bookings - verify all bookings visible

### Test 6: Edge Cases (3 min)
1. [ ] Try invalid manage token → see "Booking Not Found"
2. [ ] Try to cancel paid booking → see "contact us" message
3. [ ] Sign out from /bookings → see auth form
4. [ ] Sign in again → bookings still visible

## Rollback Plan (If Needed)

### If Critical Issues Found:

1. **Revert Frontend Deployment:**
   ```bash
   git revert HEAD
   git push origin main
   # Or redeploy previous version
   ```

2. **Rollback Database (CAUTION):**
   ```sql
   -- Only if absolutely necessary
   -- This will lose user_id and manage_token data
   
   BEGIN;
   
   -- Drop new functions
   DROP FUNCTION IF EXISTS public.claim_my_bookings();
   DROP FUNCTION IF EXISTS public.get_booking_by_token(text);
   DROP FUNCTION IF EXISTS public.cancel_booking_by_token(text);
   DROP FUNCTION IF EXISTS public.get_my_bookings();
   DROP FUNCTION IF EXISTS public.cancel_my_booking(uuid);
   
   -- Drop new columns (WARNING: data loss)
   ALTER TABLE public.bookings DROP COLUMN IF EXISTS user_id;
   ALTER TABLE public.bookings DROP COLUMN IF EXISTS manage_token;
   
   -- Restore old RLS policies
   DROP POLICY IF EXISTS "Users read own bookings" ON public.bookings;
   DROP POLICY IF EXISTS "Users update own bookings" ON public.bookings;
   
   COMMIT;
   ```

3. **Revert Edge Functions:**
   ```bash
   # Checkout previous version of edge function
   git checkout HEAD~1 supabase/functions/create-checkout-session/index.ts
   supabase functions deploy create-checkout-session
   ```

## Success Criteria

Deployment is successful when:
- ✅ All 6 post-deployment tests pass
- ✅ No errors in browser console
- ✅ No errors in Supabase logs
- ✅ Admin functions work normally
- ✅ Existing bookings still visible
- ✅ Guest bookings create manage tokens
- ✅ Account creation claims guest bookings

## Monitoring

After deployment, monitor:
1. **Supabase Logs:** Check for RPC errors
2. **Edge Function Logs:** Check for booking creation errors
3. **Browser Console:** Check for client-side errors
4. **User Reports:** Monitor for booking issues

## Support Documentation

If users report issues:
1. Check Supabase logs for their email/booking_id
2. Verify manage_token exists in bookings table
3. Check if user_id is set correctly for logged-in bookings
4. Verify RLS policies allow proper access

## Contact

For issues or questions:
- Check `docs/OPTION2_IMPLEMENTATION.md` for detailed documentation
- Review `IMPLEMENTATION_SUMMARY.md` for quick reference
- Check migration file `supabase/migrations/0013_booking_auth_claiming.sql`

---

**Date:** 2026-01-28
**Version:** Option 2 - Guest Booking with Optional Account
**Status:** Ready for Deployment
