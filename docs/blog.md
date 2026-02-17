## Blog setup (Supabase)

### Database migration
- Apply `supabase/migrations/0005_blog_system.sql` to create `blog_posts`, optional `blog_tags`, join table, indexes, and the `updated_at` trigger.
- RLS:
  - Public: can select posts where `status = 'published'` and `published_at <= now()`.
  - Admin (`profiles.role = 'admin'`): full CRUD on posts, tags, and tag joins.

### Storage bucket
- Bucket: `blog-images` (public read).
- Policies:
  - Public select on `bucket_id = 'blog-images'`.
  - Admin-only insert/update/delete on `bucket_id = 'blog-images'` (uses `is_admin()`).
- Path convention (handled in `src/lib/storage.ts`):
  - Hero: `blog-images/{postId}/hero/{timestamp}-{filename}`
  - Inline: `blog-images/{postId}/inline/{timestamp}-{filename}`

### Auth / admin
- Admin is determined by `profiles.role = 'admin'` (see `public.is_admin()`).
- To promote a user: `update public.profiles set role = 'admin' where id = '<auth_user_id>';`

### Creating/publishing from a phone
1) Log in and open `/admin/blog/new`.
2) Enter title (slug auto-fills), excerpt, and markdown content.
3) Tap “Save draft” (sticky bar on mobile) before uploading images so the post id exists.
4) Upload a hero image (shown on cards/OG) and inline images; inline uploads insert markdown automatically.
5) Set an optional scheduled publish datetime, or tap “Publish” to go live immediately.
6) Public posts appear on `/blog` and `/blog/{slug}` once `status='published'` and `published_at` is reached.

### Rendering / SEO
- Public routes only read published posts; drafts return 404.
- Markdown is sanitized client-side with DOMPurify.
- Blog post pages set `og:title`, `og:description`, `og:image`, and `article:published_time` in the document head.
