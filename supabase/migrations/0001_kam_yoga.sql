-- Kam Yoga Supabase Migration
-- Creates tables for classes, blog posts, and admin users with RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Classes table
CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  location text,
  price_eur numeric(10,2),
  capacity int,
  booking_url text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog posts table
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content_md text NOT NULL,
  cover_image_url text,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin users table
CREATE TABLE admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
-- SECURITY DEFINER ensures it runs with elevated privileges
-- STABLE indicates the function doesn't modify data and returns same result for same input
-- set search_path prevents search path attacks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- RLS Policies for classes
-- Public can read published classes
CREATE POLICY "Public can read published classes"
  ON classes FOR SELECT
  USING (is_published = true);

-- Admins can read all classes
CREATE POLICY "Admins can read all classes"
  ON classes FOR SELECT
  USING (is_admin());

-- Admins can insert classes
CREATE POLICY "Admins can insert classes"
  ON classes FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update classes
CREATE POLICY "Admins can update classes"
  ON classes FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete classes
CREATE POLICY "Admins can delete classes"
  ON classes FOR DELETE
  USING (is_admin());

-- RLS Policies for blog_posts
-- Public can read published blog posts
CREATE POLICY "Public can read published blog posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

-- Admins can read all blog posts
CREATE POLICY "Admins can read all blog posts"
  ON blog_posts FOR SELECT
  USING (is_admin());

-- Admins can insert blog posts
CREATE POLICY "Admins can insert blog posts"
  ON blog_posts FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update blog posts
CREATE POLICY "Admins can update blog posts"
  ON blog_posts FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete blog posts
CREATE POLICY "Admins can delete blog posts"
  ON blog_posts FOR DELETE
  USING (is_admin());

-- RLS Policies for admin_users
-- Admins can read admin_users
CREATE POLICY "Admins can read admin_users"
  ON admin_users FOR SELECT
  USING (is_admin());

-- Only existing admins can insert new admins
CREATE POLICY "Admins can insert admin_users"
  ON admin_users FOR INSERT
  WITH CHECK (is_admin());

-- Only existing admins can delete admin_users
CREATE POLICY "Admins can delete admin_users"
  ON admin_users FOR DELETE
  USING (is_admin());

