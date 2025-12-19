-- Add image_urls column to blog_posts table
-- This allows storing multiple images per blog post

ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS image_urls text[];

-- Add comment for documentation
COMMENT ON COLUMN blog_posts.image_urls IS 'Array of image URLs for the blog post. First image is used as cover.';
