-- Fix function signature conflicts for get_published_sessions
set check_function_bodies = off;

-- Drop existing definition (if any) to avoid return type conflicts
DROP FUNCTION IF EXISTS public.get_published_sessions();

-- Recreate aligned with current classes schema
create or replace function public.get_published_sessions()
returns table (
  id uuid,
  title text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  price_cents int,
  currency text,
  capacity int,
  is_active boolean,
  created_at timestamptz,
  paid_count int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    coalesce(c.title, 'Yoga Class') as title,
    c.description,
    c.starts_at,
    c.ends_at,
    c.price_cents,
    coalesce(c.currency, 'eur') as currency,
    c.capacity,
    c.is_active,
    c.created_at,
    coalesce((
      select count(*) from public.bookings b
      where b.class_id = c.id and b.status = 'paid'
    ), 0) as paid_count
  from public.classes c
  where c.is_active = true
  order by c.starts_at asc;
$$;

grant execute on function public.get_published_sessions() to anon, authenticated;
