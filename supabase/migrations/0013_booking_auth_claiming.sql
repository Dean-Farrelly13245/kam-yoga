-- 0013_booking_auth_claiming_hardened.sql
-- Hardened Option 2 migration:
-- - Adds bookings.user_id + bookings.manage_token
-- - Generates manage_token automatically
-- - Secure RPCs (token validation + minimal PII exposure for guests)
-- - Claim guest bookings for logged-in users
-- - RLS policies for bookings + payments (admin-only), and enables RLS
-- Safe to re-run (idempotent)

set check_function_bodies = off;

-- Required for gen_random_bytes()
create extension if not exists pgcrypto;

-- ----------------------------
-- 1) Schema: bookings.user_id
-- ----------------------------
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'bookings'
      and column_name  = 'user_id'
  ) then
    alter table public.bookings
      add column user_id uuid references auth.users(id) on delete set null;
  end if;
end
$$;

create index if not exists idx_bookings_user_id on public.bookings(user_id);

-- -------------------------------
-- 2) Schema: bookings.manage_token
-- -------------------------------
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'bookings'
      and column_name  = 'manage_token'
  ) then
    alter table public.bookings
      add column manage_token text;
  end if;
end
$$;

-- Backfill tokens for existing bookings (safe to re-run)
update public.bookings
set manage_token = encode(gen_random_bytes(32), 'hex')
where manage_token is null;

-- Ensure uniqueness (use a unique index for idempotency)
create unique index if not exists bookings_manage_token_ux
on public.bookings(manage_token);

-- ---------------------------------------------
-- 3) Trigger: generate manage_token on insert
-- ---------------------------------------------
create or replace function public.generate_booking_manage_token()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.manage_token is null then
    new.manage_token := encode(gen_random_bytes(32), 'hex');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_generate_manage_token on public.bookings;
create trigger trg_generate_manage_token
before insert on public.bookings
for each row
execute function public.generate_booking_manage_token();

-- ----------------------------
-- 4) Helper: token validation
-- ----------------------------
create or replace function public.is_valid_manage_token(p text)
returns boolean
language sql
immutable
as $$
  select p ~ '^[0-9a-f]{64}$';
$$;

-- ------------------------------------
-- 5) RPC: claim guest bookings (auth)
-- ------------------------------------
drop function if exists public.claim_my_bookings();

create or replace function public.claim_my_bookings()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.bookings
     set user_id = auth.uid()
   where user_id is null
     and lower(user_email) = lower(auth.email());
     -- claim ALL statuses so history isn't split across guest/account

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.claim_my_bookings() to authenticated;

-- -------------------------------------------------
-- 6) RPC: guest view booking by token (minimal PII)
-- -------------------------------------------------
drop function if exists public.get_booking_by_token(text);

create or replace function public.get_booking_by_token(p_token text)
returns table (
  booking_id uuid,
  class_id uuid,
  class_title text,
  class_description text,
  starts_at timestamptz,
  ends_at timestamptz,
  amount_cents int,
  currency text,
  status text,
  -- Guest-safe fields (masked / minimal)
  user_email_masked text,
  user_first_name text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.id as booking_id,
    b.class_id,
    c.title as class_title,
    c.description as class_description,
    c.starts_at,
    c.ends_at,
    coalesce(b.amount_cents, c.price_cents) as amount_cents,
    coalesce(b.currency, c.currency, 'eur') as currency,
    b.status,

    -- Mask email to reduce PII leakage if token is forwarded/leaked
    case
      when b.user_email is null then null
      else left(b.user_email, 1) || '***@' || split_part(b.user_email, '@', 2)
    end as user_email_masked,

    -- First name only (optional)
    case
      when b.user_name is null then null
      else split_part(b.user_name, ' ', 1)
    end as user_first_name,

    b.created_at
  from public.bookings b
  join public.classes c on c.id = b.class_id
  where public.is_valid_manage_token(p_token)
    and b.manage_token = p_token
  limit 1;
$$;

grant execute on function public.get_booking_by_token(text) to anon, authenticated;

-- ------------------------------------------------
-- 7) RPC: guest cancel by token (validated + safe)
-- ------------------------------------------------
drop function if exists public.cancel_booking_by_token(text);

create or replace function public.cancel_booking_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
  v_starts_at timestamptz;
begin
  -- Fast reject invalid tokens (generic error prevents signaling)
  if not public.is_valid_manage_token(p_token) then
    return jsonb_build_object('success', false, 'error', 'Booking not found');
  end if;

  select b.id, b.class_id, b.status
    into v_booking
    from public.bookings b
   where b.manage_token = p_token
   limit 1;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Booking not found');
  end if;

  select c.starts_at
    into v_starts_at
    from public.classes c
   where c.id = v_booking.class_id;

  -- Block cancellations after class has started
  if v_starts_at <= now() then
    return jsonb_build_object('success', false, 'error', 'Cannot cancel: class has already started');
  end if;

  -- Only allow cancellation of pending bookings (paid must contact support)
  if v_booking.status <> 'pending' then
    return jsonb_build_object('success', false, 'error', 'Only pending bookings can be cancelled. For paid bookings, please contact us.');
  end if;

  -- Cancel
  update public.bookings
     set status = 'cancelled'
   where id = v_booking.id;

  return jsonb_build_object('success', true, 'message', 'Booking cancelled successfully');
end;
$$;

grant execute on function public.cancel_booking_by_token(text) to anon, authenticated;

-- ---------------------------------------------
-- 8) RPC: get my bookings (authenticated users)
-- ---------------------------------------------
drop function if exists public.get_my_bookings();

create or replace function public.get_my_bookings()
returns table (
  booking_id uuid,
  class_id uuid,
  class_title text,
  class_description text,
  starts_at timestamptz,
  ends_at timestamptz,
  amount_cents int,
  currency text,
  status text,
  user_email text,
  user_name text,
  user_phone text,
  created_at timestamptz,
  paid_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.id as booking_id,
    b.class_id,
    c.title as class_title,
    c.description as class_description,
    c.starts_at,
    c.ends_at,
    coalesce(b.amount_cents, c.price_cents) as amount_cents,
    coalesce(b.currency, c.currency, 'eur') as currency,
    b.status,
    b.user_email,
    b.user_name,
    b.user_phone,
    b.created_at,
    b.paid_at
  from public.bookings b
  join public.classes c on c.id = b.class_id
  where b.user_id = auth.uid()
  order by c.starts_at desc;
$$;

grant execute on function public.get_my_bookings() to authenticated;

-- -----------------------------------------------
-- 9) RPC: cancel my booking (authenticated users)
-- -----------------------------------------------
drop function if exists public.cancel_my_booking(uuid);

create or replace function public.cancel_my_booking(p_booking_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
  v_starts_at timestamptz;
begin
  if auth.uid() is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select b.id, b.class_id, b.status
    into v_booking
    from public.bookings b
   where b.id = p_booking_id
     and b.user_id = auth.uid();

  if not found then
    return jsonb_build_object('success', false, 'error', 'Booking not found or access denied');
  end if;

  select c.starts_at
    into v_starts_at
    from public.classes c
   where c.id = v_booking.class_id;

  if v_starts_at <= now() then
    return jsonb_build_object('success', false, 'error', 'Cannot cancel: class has already started');
  end if;

  if v_booking.status <> 'pending' then
    return jsonb_build_object('success', false, 'error', 'Only pending bookings can be cancelled. For paid bookings, please contact us.');
  end if;

  update public.bookings
     set status = 'cancelled'
   where id = v_booking.id;

  return jsonb_build_object('success', true, 'message', 'Booking cancelled successfully');
end;
$$;

grant execute on function public.cancel_my_booking(uuid) to authenticated;

-- -----------------------------
-- 10) Enable RLS (if not already)
-- -----------------------------
alter table public.bookings enable row level security;
alter table public.payments enable row level security;

-- -----------------------------
-- 11) RLS policies: bookings
-- -----------------------------
drop policy if exists "Admins read bookings" on public.bookings;
drop policy if exists "Admins manage bookings" on public.bookings;
drop policy if exists "Users read own bookings" on public.bookings;
drop policy if exists "Users update own bookings" on public.bookings;

-- Admin full access
create policy "Admins read bookings"
on public.bookings
for select
using (public.is_admin());

create policy "Admins manage bookings"
on public.bookings
for all
using (public.is_admin())
with check (public.is_admin());

-- Logged-in users can read their own bookings
create policy "Users read own bookings"
on public.bookings
for select
using (auth.uid() = user_id);

-- Updates are allowed for future flexibility, but cancellation should primarily go through RPCs
create policy "Users update own bookings"
on public.bookings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- NOTE:
-- We do NOT add an INSERT policy here.
-- Recommended: create bookings via your Edge Function using the service role.
-- If your app inserts bookings client-side, you'll need a carefully designed insert strategy (RPC/Edge Function).

-- -----------------------------
-- 12) RLS policies: payments (admin-only)
-- -----------------------------
drop policy if exists "Admins read payments" on public.payments;
drop policy if exists "Admins manage payments" on public.payments;

create policy "Admins read payments"
on public.payments
for select
using (public.is_admin());

create policy "Admins manage payments"
on public.payments
for all
using (public.is_admin())
with check (public.is_admin());
