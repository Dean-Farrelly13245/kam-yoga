-- Blog system: posts, tags, storage bucket, and RLS
set check_function_bodies = off;

-- Ensure uuid extension (used by defaults)
create extension if not exists "uuid-ossp";

-- Admin helper (idempotent with previous migrations)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- Blog tables
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  hero_image_url text,
  image_urls text[],
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Align legacy blog_posts tables (content_md/is_published/cover_image_url) to new schema
alter table if exists public.blog_posts
  add column if not exists author_id uuid references public.profiles(id) on delete set null,
  add column if not exists content text,
  add column if not exists hero_image_url text,
  add column if not exists image_urls text[],
  add column if not exists status text check (status in ('draft','published')),
  add column if not exists published_at timestamptz;

do $$
begin
  if exists(select 1 from information_schema.columns where table_name = 'blog_posts' and column_name = 'content_md') then
    update public.blog_posts
    set content = coalesce(content, content_md);
  end if;
  if exists(select 1 from information_schema.columns where table_name = 'blog_posts' and column_name = 'cover_image_url') then
    update public.blog_posts
    set hero_image_url = coalesce(hero_image_url, cover_image_url);
  end if;
  if exists(select 1 from information_schema.columns where table_name = 'blog_posts' and column_name = 'is_published') then
    update public.blog_posts
    set status = coalesce(status, case when is_published = true then 'published' else 'draft' end);
  end if;
end;
$$;

alter table if exists public.blog_posts
  alter column content set not null,
  alter column status set not null;

alter table if exists public.blog_posts drop column if exists content_md;
alter table if exists public.blog_posts drop column if exists cover_image_url;
alter table if exists public.blog_posts drop column if exists is_published;

create table if not exists public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- Indexes
create index if not exists idx_blog_posts_status_published_at
  on public.blog_posts (status, published_at desc);
create index if not exists idx_blog_posts_slug
  on public.blog_posts (slug);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row
execute function public.set_updated_at();

-- RLS
alter table public.blog_posts enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_post_tags enable row level security;

-- Public: read published posts only
drop policy if exists "Public can read published blog posts" on public.blog_posts;
drop policy if exists "Admins can read all blog posts" on public.blog_posts;
drop policy if exists "Admins can insert blog posts" on public.blog_posts;
drop policy if exists "Admins can update blog posts" on public.blog_posts;
drop policy if exists "Admins can delete blog posts" on public.blog_posts;
create policy "Public can read published posts" on public.blog_posts
  for select
  using (status = 'published' and published_at is not null and published_at <= now());

-- Admin: full access
create policy "Admins manage blog posts" on public.blog_posts
  for all
  using (is_admin())
  with check (is_admin());

create policy "Admins manage blog tags" on public.blog_tags
  for all
  using (is_admin())
  with check (is_admin());

create policy "Admins manage blog post tags" on public.blog_post_tags
  for all
  using (is_admin())
  with check (is_admin());

-- Supabase Storage: blog images bucket
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

-- Storage policies
drop policy if exists "Public can read blog images" on storage.objects;
drop policy if exists "Admins can upload blog images" on storage.objects;
drop policy if exists "Admins can update blog images" on storage.objects;
drop policy if exists "Admins can delete blog images" on storage.objects;
create policy "Public read blog images"
  on storage.objects for select
  using (bucket_id = 'blog-images');

create policy "Admin upload blog images"
  on storage.objects for insert
  with check (bucket_id = 'blog-images' and is_admin());

create policy "Admin update blog images"
  on storage.objects for update
  using (bucket_id = 'blog-images' and is_admin());

create policy "Admin delete blog images"
  on storage.objects for delete
  using (bucket_id = 'blog-images' and is_admin());
