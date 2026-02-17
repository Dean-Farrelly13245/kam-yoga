-- Simplify class sessions to single-location, single-level model
set check_function_bodies = off;

-- Add simple title/description directly on class_sessions (keep existing rows)
alter table if exists public.class_sessions
  add column if not exists title text,
  add column if not exists description text;

-- Backfill title/description from class_types where available
update public.class_sessions s
set
  title = coalesce(s.title, ct.title, 'Yoga Class'),
  description = coalesce(s.description, ct.description)
from public.class_types ct
where ct.id = s.class_type_id;

-- Ensure title is not null going forward
alter table if exists public.class_sessions
  alter column title set default 'Yoga Class';

-- Simplified published sessions RPC (drops style/level/location filters)
-- Drop existing definition to avoid return type conflicts
drop function if exists public.get_published_sessions();

create or replace function public.get_published_sessions()
returns table (
  id uuid,
  title text,
  description text,
  start_time timestamptz,
  end_time timestamptz,
  price_cents int,
  currency text,
  capacity int,
  is_published boolean,
  created_at timestamptz,
  paid_count int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id,
    coalesce(s.title, 'Yoga Class') as title,
    s.description,
    s.start_time,
    s.end_time,
    s.price_cents,
    coalesce(s.currency, 'eur') as currency,
    s.capacity,
    s.is_published,
    s.created_at,
    coalesce((
      select count(*) from public.bookings b
      where b.session_id = s.id and b.status = 'paid'
    ), 0) as paid_count
  from public.class_sessions s
  where s.is_published = true
  order by s.start_time asc;
$$;

grant execute on function public.get_published_sessions() to anon, authenticated;
