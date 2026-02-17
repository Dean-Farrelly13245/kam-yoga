-- Tighten RLS and add admin_users allowlist + is_admin helper
set check_function_bodies = off;

create extension if not exists "uuid-ossp";

-- Admin allowlist
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Helper to check if current authenticated user is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users a
    where lower(a.email) = lower(auth.email())
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- Enable RLS
alter table if exists public.admin_users enable row level security;
alter table if exists public.classes enable row level security;
alter table if exists public.bookings enable row level security;
alter table if exists public.payments enable row level security;

-- Drop old policies if present
do $$
declare
  rec record;
begin
  for rec in select policyname from pg_policies where schemaname='public' and tablename='classes' loop
    execute format('drop policy if exists %I on public.classes', rec.policyname);
  end loop;
  for rec in select policyname from pg_policies where schemaname='public' and tablename='bookings' loop
    execute format('drop policy if exists %I on public.bookings', rec.policyname);
  end loop;
  for rec in select policyname from pg_policies where schemaname='public' and tablename='payments' loop
    execute format('drop policy if exists %I on public.payments', rec.policyname);
  end loop;
end
$$;

-- Admin users policies
create policy "Admins read admin_users" on public.admin_users
  for select using (public.is_admin());

create policy "Admins manage admin_users" on public.admin_users
  for all using (public.is_admin()) with check (public.is_admin());

-- Classes policies
create policy "Public read active classes" on public.classes
  for select using (is_active = true);

create policy "Admins manage classes" on public.classes
  for all using (public.is_admin()) with check (public.is_admin());

-- Bookings policies (public cannot insert/read; edge functions use service role)
create policy "Admins read bookings" on public.bookings
  for select using (public.is_admin());

create policy "Admins manage bookings" on public.bookings
  for all using (public.is_admin()) with check (public.is_admin());

-- Payments policies (admin only)
create policy "Admins read payments" on public.payments
  for select using (public.is_admin());

create policy "Admins manage payments" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

-- Ensure confirm_booking_payment remains callable by service role (security definer is already set in prior migration)
grant execute on function public.confirm_booking_payment(uuid, text, text, int, text, text, text) to service_role;

