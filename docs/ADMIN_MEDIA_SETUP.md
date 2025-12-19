# Admin Media Setup - Blog Images

This guide explains how to set up Supabase Storage for blog post image uploads in the Kam Yoga admin system.

## Overview

The blog admin allows owners to upload multiple images per blog post directly through the UI, without needing to paste image URLs. Images are stored in Supabase Storage and displayed on the public blog pages.

## Prerequisites

- Supabase project set up
- Admin authentication configured
- `is_admin()` function available (from `0001_kam_yoga.sql`)

## Setup Steps

### 1. Create Storage Bucket

In your Supabase Dashboard:

1. Go to **Storage** → **Buckets**
2. Click **New bucket**
3. Set the following:
   - **Name**: `blog-images`
   - **Public bucket**: ✅ Yes (blog images are public)
   - Click **Create bucket**

Alternatively, you can create the bucket via SQL (if you have the storage extension enabled):

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;
```

### 2. Apply Storage Policies

Run the migration file `supabase/migrations/0002_blog_images_storage.sql` which contains the storage policies:

```sql
-- Public read access (anyone can view blog images)
CREATE POLICY "Public can read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

-- Only admins can upload (insert) images
CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-images' AND
    public.is_admin()
  );

-- Only admins can update images
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

-- Only admins can delete images
CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'blog-images' AND
    public.is_admin()
  );
```

**Important**: These policies ensure that:
- Anyone can view blog images (public read)
- Only authenticated admins can upload, update, or delete images

### 3. Add Database Column

Run the migration `supabase/migrations/0003_add_image_urls_to_blog_posts.sql`:

```sql
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS image_urls text[];
```

This adds the `image_urls` array column to store multiple image URLs per post.

## Usage

### Admin Interface

1. Navigate to `/admin/blog`
2. Create or edit a blog post
3. Click **"Upload Photos"** button
4. Select one or more image files (max 8MB each)
5. Images will upload and appear as thumbnails
6. Manage images:
   - **Set as cover**: Click the star icon (first image is automatically the cover)
   - **Reorder**: Use left/right arrow buttons
   - **Remove**: Click the X button
7. Save the post

### Image Storage

- Images are stored in: `blog/{postId}/{timestamp}-{random}-{filename}`
- For new posts (not yet saved), images use `blog/temp/...` and should be moved after post creation
- Public URLs are automatically generated and stored in `image_urls` array
- `cover_image_url` is automatically set to `image_urls[0]` for backwards compatibility

### Public Display

- **Blog List**: Shows cover image (first image from `image_urls` or `cover_image_url`)
- **Blog Detail**: Shows cover image at top, then gallery of remaining images below content
- **Lightbox**: Click any image to view in full-screen modal

## File Structure

```
src/
  lib/
    storage.ts              # Storage helper functions
  pages/
    admin/
      AdminBlog.tsx         # Admin blog editor with upload UI
  components/
    blog/
      BlogCard.tsx          # Blog card with cover image
  pages/
    BlogPost.tsx            # Blog detail with gallery
supabase/
  migrations/
    0002_blog_images_storage.sql    # Storage bucket policies
    0003_add_image_urls_to_blog_posts.sql  # Database column
docs/
  ADMIN_MEDIA_SETUP.md      # This file
```

## Security Notes

- **Upload Restrictions**: Only authenticated admins can upload (enforced by RLS policies)
- **File Validation**: Frontend validates file type (images only) and size (max 8MB)
- **Storage Policies**: Backend policies prevent unauthorized uploads even if frontend is bypassed
- **Public Access**: Images are publicly readable (intentional for blog display)

## Troubleshooting

### Upload Fails

- Check that the `blog-images` bucket exists and is public
- Verify storage policies are applied correctly
- Ensure user is authenticated as admin
- Check browser console for error messages

### Images Not Displaying

- Verify `image_urls` column exists in `blog_posts` table
- Check that images were uploaded successfully (check Storage in Supabase Dashboard)
- Ensure bucket is set to public

### Can't Delete Images

- Verify admin status
- Check storage policies allow DELETE for admins
- If delete fails, images are still removed from UI but may remain in storage (cleanup manually if needed)

## Migration Order

1. `0001_kam_yoga.sql` - Base tables and `is_admin()` function
2. `0002_blog_images_storage.sql` - Storage bucket policies
3. `0003_add_image_urls_to_blog_posts.sql` - Add `image_urls` column

## Notes

- The system maintains backwards compatibility with `cover_image_url`
- If `image_urls` is empty, it falls back to `cover_image_url`
- First image in `image_urls` is automatically used as cover
- Images uploaded before post creation use `temp` folder (should be moved after post is saved, but current implementation works fine)
