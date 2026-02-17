# Quick Fix Guide - P0 Blockers

This guide walks through applying the critical fixes to make the Kam Yoga Sanctuary app production-ready.

---

## Prerequisites

- Supabase CLI installed
- Database connection configured
- Admin access to Supabase project

---

## Fix 1: Resolve Schema Conflict

### Problem
Migration 0005 defined `is_admin()` using `profiles.role`, but migration 0011 redefined it using `admin_users.email`. This causes runtime errors.

### Solution
Run migration 0012 to drop `profiles` table and ensure consistent use of `admin_users`.

### Steps

1. **Apply migration:**
   ```bash
   cd supabase
   supabase db push
   ```

2. **Verify migration applied:**
   ```bash
   supabase db diff
   ```
   Should show no pending changes.

3. **Add admin user (if not exists):**
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO public.admin_users (email)
   VALUES ('your-admin-email@example.com')
   ON CONFLICT (email) DO NOTHING;
   ```

4. **Test admin login:**
   - Navigate to `/admin/login`
   - Login with admin email
   - Should redirect to `/admin` dashboard
   - If fails, check:
     - Admin user exists in `admin_users` table
     - Email matches exactly (case-insensitive)
     - `is_admin()` RPC exists and works

5. **Test blog image upload:**
   - Login as admin
   - Navigate to `/admin/blog/new`
   - Click "Save draft" first (to get post ID)
   - Try uploading hero image
   - Should succeed
   - Try uploading as non-admin (should fail)

---

## Fix 2: "My Bookings" Page

### Problem
Users have no way to view or manage their bookings.

### Solution
Added `/bookings` route and `MyBookings.tsx` page.

### Steps

1. **Verify files exist:**
   - `src/pages/MyBookings.tsx` ✅ Created
   - `src/App.tsx` ✅ Updated with route

2. **Test functionality:**
   - Navigate to `/bookings`
   - Enter email used for test booking
   - Should display all bookings for that email
   - Verify booking details (class, date, time, status)
   - Test cancel button for pending booking
   - Verify paid bookings show "contact us" message

3. **Test on mobile:**
   - Open on phone
   - Verify responsive layout
   - Test email input and search
   - Verify booking cards display correctly

---

## Verification Checklist

### Database
- [ ] Migration 0012 applied successfully
- [ ] `profiles` table dropped
- [ ] `admin_users` table exists
- [ ] Admin user added to `admin_users`
- [ ] `is_admin()` RPC works

### Admin Access
- [ ] Can login at `/admin/login`
- [ ] Redirected to `/admin` dashboard
- [ ] Can access `/admin/classes`
- [ ] Can access `/admin/blog`
- [ ] Can upload blog images

### User Features
- [ ] Can browse classes at `/classes`
- [ ] Can book class (Stripe test mode)
- [ ] Can view bookings at `/bookings`
- [ ] Can cancel pending booking
- [ ] Booking confirmation works

### Security
- [ ] Non-admin cannot access `/admin/*` routes
- [ ] Non-admin cannot upload blog images
- [ ] RLS policies enforced on all tables

---

## Troubleshooting

### "is_admin() function does not exist"
**Cause:** Migration 0012 not applied or failed  
**Fix:** Run `supabase db push` again, check for errors

### "Admin user not found"
**Cause:** Email not in `admin_users` table  
**Fix:** Run INSERT query above with correct email

### "Permission denied for table admin_users"
**Cause:** RLS policies not applied  
**Fix:** Re-run migration 0012, verify policies exist

### "Blog image upload fails"
**Cause:** Storage policies not applied or `is_admin()` broken  
**Fix:** 
1. Verify `is_admin()` works (login as admin)
2. Check storage policies exist (Supabase dashboard → Storage → blog-images → Policies)
3. Re-run migration 0012

### "My Bookings page shows no bookings"
**Cause:** Email doesn't match exactly  
**Fix:** 
1. Check email in database (lowercase)
2. Try exact email from booking confirmation
3. Check bookings table has data

---

## Next Steps (P1 Improvements)

After P0 fixes are verified, consider implementing:

1. **User Authentication** (P1)
   - Enable Supabase Auth with magic link
   - Add `user_id` to bookings table
   - Update RLS policies

2. **Class Detail Page** (P1)
   - Complete `ClassSession.tsx`
   - Show full class details
   - Add "Book Now" button

3. **Per-Class Attendee List** (P1)
   - Add "View Attendees" button in AdminClasses
   - Show paid bookings for specific class

4. **Block Cancellations After Class Starts** (P1)
   - Update `cancel_pending_booking` RPC
   - Check `starts_at < now()`

See `AUDIT_REPORT.md` for full details.

---

## Support

If you encounter issues not covered here:
1. Check Supabase logs (Dashboard → Logs)
2. Check browser console for errors
3. Review `AUDIT_REPORT.md` for detailed analysis
4. Check migration files in `supabase/migrations/`
