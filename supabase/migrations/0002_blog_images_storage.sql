-- Blog Images Storage Setup
-- Creates storage bucket and policies for blog post images

-- Create the blog-images bucket (if it doesn't exist)
-- Note: Bucket creation via SQL requires Supabase Storage extension
-- This migration assumes the bucket is created via Supabase Dashboard or CLI
-- If using SQL, you may need to use: INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Storage policies for blog-images bucket
-- These policies control access to storage.objects in the blog-images bucket

-- Policy 1: Public read access (anyone can view blog images)
CREATE POLICY "Public can read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

-- Policy 2: Only admins can upload (insert) images
CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-images' AND
    public.is_admin()
  );

-- Policy 3: Only admins can update images
CREATE POLICY "Admins can update blog images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'blog-images' AND
    public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'blog-images' AND
    public.is_admin()
  );

-- Policy 4: Only admins can delete images
CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'blog-images' AND
    public.is_admin()
  );
