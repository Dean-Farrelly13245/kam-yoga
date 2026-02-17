-- Fix profiles vs admin_users conflict
-- This migration ensures we use admin_users consistently across the system

set check_function_bodies = off;

-- Drop profiles table if it exists (it's not used in the current system)
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.blog_post_tags CASCADE;
DROP TABLE IF EXISTS public.blog_tags CASCADE;

-- Ensure admin_users table exists with correct structure
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Ensure is_admin() uses admin_users consistently
DROP FUNCTION IF EXISTS public.is_admin();
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users a
    WHERE lower(a.email) = lower(auth.email())
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- Update blog_posts to remove author_id reference to profiles
ALTER TABLE IF EXISTS public.blog_posts DROP COLUMN IF EXISTS author_id;

-- Re-enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Admins read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins manage admin_users" ON public.admin_users;

-- Create admin_users policies
CREATE POLICY "Admins read admin_users" ON public.admin_users
  FOR SELECT USING (public.is_admin());
  
CREATE POLICY "Admins manage admin_users" ON public.admin_users
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Re-create blog storage policies (in case they were broken by profiles reference)
DROP POLICY IF EXISTS "Public read blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete blog images" ON storage.objects;

CREATE POLICY "Public read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admin upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());

CREATE POLICY "Admin update blog images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-images' AND public.is_admin());

CREATE POLICY "Admin delete blog images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND public.is_admin());

-- Verify blog_posts RLS policies
DROP POLICY IF EXISTS "Public can read published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins manage blog posts" ON public.blog_posts;

CREATE POLICY "Public can read published posts" ON public.blog_posts
  FOR SELECT
  USING (status = 'published' AND published_at IS NOT NULL AND published_at <= now());

CREATE POLICY "Admins manage blog posts" ON public.blog_posts
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
