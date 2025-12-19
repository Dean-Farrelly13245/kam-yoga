# Kam Yoga Admin System - Implementation Summary

## Overview

A secure admin system has been implemented using Supabase for managing yoga classes and blog posts. The system includes authentication, route protection, and full CRUD operations for both classes and blog posts.

## Files Created/Modified

### Database & Configuration

1. **`supabase/migrations/0001_kam_yoga.sql`**
   - Creates `classes`, `blog_posts`, and `admin_users` tables
   - Sets up Row Level Security (RLS) policies
   - Public can only read published content
   - Admins can read/write everything
   - Includes `is_admin()` helper function

2. **`package.json`**
   - Added `@supabase/supabase-js` for Supabase client
   - Added `marked` for markdown rendering
   - Added `dompurify` for XSS protection (sanitizes rendered HTML)

3. **`.env.example`**
   - Template for Supabase environment variables

### Core Supabase Integration

4. **`src/lib/supabaseClient.ts`** (NEW)
   - Supabase client singleton
   - TypeScript interfaces for `Class`, `BlogPost`, and `AdminUser`
   - Exports configured Supabase client

### Authentication & Authorization

5. **`src/hooks/useAdmin.ts`** (NEW)
   - Custom hook to check admin status
   - Verifies user session and admin_users table membership
   - Returns admin status and loading state

6. **`src/components/admin/AdminGuard.tsx`** (NEW)
   - Route protection component
   - Shows loading state while checking auth
   - Redirects non-admins to login
   - Displays "Not Authorized" for non-admin users

### Admin Pages

7. **`src/pages/admin/Login.tsx`** (NEW)
   - Admin login page at `/admin/login`
   - Email/password authentication via Supabase
   - Verifies admin status after login
   - Redirects to dashboard on success

8. **`src/pages/admin/Dashboard.tsx`** (NEW)
   - Admin dashboard at `/admin`
   - Links to Classes and Blog management
   - Sign out functionality

9. **`src/pages/admin/AdminClasses.tsx`** (NEW)
   - Classes management at `/admin/classes`
   - List all classes (published + drafts)
   - Create, edit, delete classes
   - Toggle publish/unpublish
   - Form fields: title, description, date, times, location, price, capacity, booking_url

10. **`src/pages/admin/AdminBlog.tsx`** (NEW)
    - Blog posts management at `/admin/blog`
    - List all posts (published + drafts)
    - Create, edit, delete posts
    - Auto-generates slug from title (editable)
    - Form fields: title, slug, excerpt, content_md, cover_image_url, is_published
    - Sets `published_at` when publishing

### Public Pages Updated

11. **`src/pages/Classes.tsx`** (MODIFIED)
    - Now fetches published classes from Supabase
    - Removed filter functionality
    - Shows loading state

12. **`src/components/classes/ClassCard.tsx`** (MODIFIED)
    - Updated to work with Supabase `Class` type
    - Removed type badges
    - Calculates duration from start_time/end_time
    - Shows booking_url link if available

13. **`src/components/classes/BookingModal.tsx`** (MODIFIED)
    - Updated to work with Supabase `Class` type
    - Handles optional fields (location, price, end_time)

14. **`src/pages/Blog.tsx`** (MODIFIED)
    - Now fetches published blog posts from Supabase
    - Removed category filters
    - Shows loading state

15. **`src/components/blog/BlogCard.tsx`** (MODIFIED)
    - Updated to work with Supabase `BlogPost` type
    - Removed category badges
    - Estimates read time from content
    - Uses published_at or created_at for date

16. **`src/pages/BlogPost.tsx`** (MODIFIED)
    - Fetches single post by slug from Supabase
    - Renders markdown content using `marked` library
    - Shows cover image if available
    - Displays related posts
    - Estimates read time

### Routing

17. **`src/App.tsx`** (MODIFIED)
    - Added admin routes:
      - `/admin/login` - Login page
      - `/admin` - Dashboard
      - `/admin/classes` - Classes management
      - `/admin/blog` - Blog management

## Admin Routes

All admin routes are protected and require authentication:

- **`/admin/login`** - Public login page
- **`/admin`** - Dashboard (protected)
- **`/admin/classes`** - Classes management (protected)
- **`/admin/blog`** - Blog posts management (protected)

## Setup Instructions

### 1. Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Run the migration file in Supabase SQL Editor:
   - Go to SQL Editor in your Supabase dashboard
   - Copy contents of `supabase/migrations/0001_kam_yoga.sql`
   - Execute the migration

### 2. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from:
- Supabase Dashboard → Settings → API
- `VITE_SUPABASE_URL` = Project URL
- `VITE_SUPABASE_ANON_KEY` = `anon` `public` key

### 3. Create Admin User

1. In Supabase Dashboard, go to Authentication → Users
2. Create a new user (or use existing)
3. Note the user's `id` (UUID)
4. Go to SQL Editor and run:

```sql
INSERT INTO admin_users (user_id, email)
VALUES ('user-uuid-here', 'admin@example.com');
```

Replace `user-uuid-here` with the actual user ID and `admin@example.com` with the user's email.

### 4. Install Dependencies

```bash
npm install
```

### 5. Development

```bash
npm run dev
```

## Security Features

- **Row Level Security (RLS)**: All tables have RLS enabled
- **Public Read-Only**: Public users can only read `is_published = true` content
- **Admin-Only Writes**: Only users in `admin_users` table can create/update/delete
- **Route Protection**: Admin routes are protected by `AdminGuard` component
- **Session Verification**: Admin status is verified on every admin route access
- **XSS Protection**: All markdown content is sanitized using DOMPurify before rendering
- **Secure RLS Function**: `is_admin()` function uses `SECURITY DEFINER`, `STABLE`, and `SET search_path` for security
- **Double Protection**: Both frontend guards (UX) and RLS policies (real security) protect admin operations
- **No Email Hardcoding**: Admin status is determined solely by `admin_users` table, never by email checks

## Database Schema

### `classes`
- `id` (uuid, primary key)
- `title` (text, required)
- `description` (text, nullable)
- `date` (date, required)
- `start_time` (time, required)
- `end_time` (time, nullable)
- `location` (text, nullable)
- `price_eur` (numeric, nullable)
- `capacity` (int, nullable)
- `booking_url` (text, nullable)
- `is_published` (boolean, default false)
- `created_at`, `updated_at` (timestamps)

### `blog_posts`
- `id` (uuid, primary key)
- `title` (text, required)
- `slug` (text, unique, required)
- `excerpt` (text, nullable)
- `content_md` (text, required) - Markdown content
- `cover_image_url` (text, nullable)
- `is_published` (boolean, default false)
- `published_at` (timestamptz, nullable)
- `created_at`, `updated_at` (timestamps)

### `admin_users`
- `user_id` (uuid, primary key, references auth.users)
- `email` (text, unique, required)
- `created_at` (timestamptz)

## Security Notes

- **XSS Protection**: Blog post markdown is sanitized with DOMPurify before rendering
- **RLS Function Security**: The `is_admin()` function is marked as `SECURITY DEFINER`, `STABLE`, and uses `SET search_path = public` to prevent search path attacks
- **Policy Security**: All UPDATE policies include both `USING` and `WITH CHECK` clauses
- **No Email Checks**: Admin status is never determined by email - only by `admin_users` table membership
- **Double Protection**: Even if someone bypasses the frontend, RLS policies prevent unauthorized access

## Quality Features

- **Publish Timestamps**: `published_at` is automatically set when publishing, cleared when unpublishing
- **Slug Collision Handling**: If a slug already exists, the system suggests an available alternative (e.g., `slug-2`, `slug-3`)
- **Form Validation**: All forms include client-side validation with helpful error messages
- **Toast Notifications**: All admin operations provide user feedback via toast notifications
- **Loading States**: All pages show appropriate loading states while fetching data
- **Empty States**: Public pages gracefully handle empty states with helpful messages

## Notes

- The admin system uses the existing Kam Yoga UI design system
- All forms include validation and error handling
- Markdown rendering uses the `marked` library with DOMPurify sanitization
- Public pages gracefully handle empty states
- All admin operations include toast notifications for feedback

## Next Steps

1. Set up Supabase project and run migration
2. Add environment variables
3. Create first admin user
4. Test admin login and CRUD operations
5. Create some sample classes and blog posts
6. Verify public pages display published content correctly

