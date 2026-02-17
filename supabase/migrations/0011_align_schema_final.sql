-- Align schema to current live Kam Yoga model (classes/bookings/payments/admin_users)
set check_function_bodies = off;

-- 1) Ensure classes table exists with correct columns
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'classes'
  ) then
    create table public.classes (
      id uuid primary key default gen_random_uuid(),
      title text not null default 'Yoga Class',
      description text,
      starts_at timestamptz,
      ends_at timestamptz,
      price_cents int not null,
      currency text not null default 'eur',
      capacity int,
      is_active boolean not null default true,
      created_at timestamptz not null default now()
    );
  end if;

  -- If legacy class_sessions exists, migrate data into classes
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'class_sessions'
  ) then
    insert into public.classes (id, title, description, starts_at, ends_at, price_cents, currency, capacity, is_active, created_at)
    select
      cs.id,
      coalesce(cs.title, 'Yoga Class'),
      cs.description,
      cs.start_time,
      cs.end_time,
      cs.price_cents,
      coalesce(cs.currency, 'eur'),
      cs.capacity,
      cs.is_published,
      cs.created_at
    from public.class_sessions cs
    on conflict (id) do nothing;

    drop table if exists public.class_sessions cascade;
  end if;

  -- Ensure required columns/defaults on classes
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='classes' and column_name='currency'
  ) then
    alter table public.classes add column currency text not null default 'eur';
  end if;
  alter table public.classes
    alter column title set default 'Yoga Class',
    alter column currency set default 'eur';
  update public.classes set currency = 'eur' where currency is null;
end
$$;

-- 2) Ensure bookings table aligns
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='bookings'
  ) then
    create table public.bookings (
      id uuid primary key default gen_random_uuid(),
      class_id uuid references public.classes(id) on delete cascade,
      user_email text not null,
      user_name text,
      user_phone text,
      status text not null check (status in ('pending','paid','cancelled','refunded')),
      amount_cents int,
      currency text default 'eur',
      stripe_checkout_session_id text unique,
      stripe_payment_intent_id text,
      paid_at timestamptz,
      created_at timestamptz not null default now()
    );
  else
    -- legacy renames
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='session_id') then
      alter table public.bookings rename column session_id to class_id;
    end if;
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='customer_name') then
      alter table public.bookings rename column customer_name to user_name;
    end if;
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='customer_email') then
      alter table public.bookings rename column customer_email to user_email;
    end if;
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='customer_phone') then
      alter table public.bookings rename column customer_phone to user_phone;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='stripe_checkout_session_id') then
      alter table public.bookings add column stripe_checkout_session_id text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='stripe_payment_intent_id') then
      alter table public.bookings add column stripe_payment_intent_id text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='amount_cents') then
      alter table public.bookings add column amount_cents int;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='currency') then
      alter table public.bookings add column currency text default 'eur';
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='paid_at') then
      alter table public.bookings add column paid_at timestamptz;
    end if;
    alter table public.bookings
      alter column currency set default 'eur';
    update public.bookings set currency = 'eur' where currency is null;
    -- unique on checkout_session
    do $u$
    begin
      if not exists (
        select 1 from pg_constraint
        where conname='bookings_stripe_checkout_session_id_key'
      ) then
        alter table public.bookings add constraint bookings_stripe_checkout_session_id_key unique (stripe_checkout_session_id);
      end if;
    end
    $u$;
  end if;
end
$$;

-- 3) Ensure payments table aligns
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='payments'
  ) then
    create table public.payments (
      id uuid primary key default gen_random_uuid(),
      booking_id uuid not null references public.bookings(id) on delete cascade,
      stripe_event_id text unique,
      stripe_payment_intent_id text,
      amount_cents int not null,
      currency text not null default 'eur',
      status text not null check (status in ('succeeded','failed','refunded','created')),
      created_at timestamptz not null default now()
    );
  else
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='payments' and column_name='stripe_event_id') then
      alter table public.payments add column stripe_event_id text;
    end if;
    if not exists (
      select 1 from pg_constraint where conname='payments_stripe_event_id_key'
    ) then
      alter table public.payments add constraint payments_stripe_event_id_key unique (stripe_event_id);
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='payments' and column_name='currency') then
      alter table public.payments add column currency text not null default 'eur';
    end if;
    alter table public.payments alter column currency set default 'eur';
  end if;
end
$$;

-- 4) Indexes
create index if not exists idx_classes_starts_at on public.classes(starts_at);
create index if not exists idx_classes_is_active on public.classes(is_active);
create index if not exists idx_bookings_class_id on public.bookings(class_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_created_at on public.bookings(created_at);
create index if not exists idx_payments_created_at on public.payments(created_at);
create index if not exists idx_payments_status on public.payments(status);

-- 5) Functions
drop function if exists public.get_published_classes();
drop function if exists public.get_published_sessions();
drop function if exists public.get_booking_public(text);
drop function if exists public.get_booking_public_by_id(uuid);
drop function if exists public.cancel_pending_booking(uuid);
drop function if exists public.confirm_booking_payment(uuid, text, text, int, text, text, text);
drop function if exists public.is_admin();

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

create or replace function public.confirm_booking_payment(
  p_booking_id uuid,
  p_checkout_session_id text,
  p_payment_intent_id text,
  p_amount_cents int,
  p_currency text,
  p_payment_status text,
  p_event_id text
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_capacity int;
  v_paid_count int;
begin
  select b.class_id into v_class_id
  from public.bookings b
  where b.id = p_booking_id
  for update;

  if v_class_id is null then
    return 'booking_not_found';
  end if;

  select c.capacity into v_capacity
  from public.classes c
  where c.id = v_class_id
  for update;

  select count(*) into v_paid_count
  from public.bookings b
  where b.class_id = v_class_id and b.status = 'paid';

  if v_capacity is not null and v_paid_count >= v_capacity then
    update public.bookings
      set status = 'cancelled',
          stripe_checkout_session_id = coalesce(p_checkout_session_id, stripe_checkout_session_id),
          stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id)
    where id = p_booking_id;
    if p_event_id is not null then
      insert into public.payments (
        booking_id,
        stripe_event_id,
        stripe_payment_intent_id,
        amount_cents,
        currency,
        status
      ) values (
        p_booking_id,
        p_event_id,
        p_payment_intent_id,
        coalesce(p_amount_cents, 0),
        coalesce(p_currency, 'eur'),
        'failed'
      ) on conflict (stripe_event_id) do nothing;
    end if;
    return 'capacity_full';
  end if;

  update public.bookings
    set status = case
                   when p_payment_status = 'succeeded' then 'paid'
                   when p_payment_status = 'refunded' then 'refunded'
                   else 'cancelled'
                 end,
        stripe_checkout_session_id = coalesce(p_checkout_session_id, stripe_checkout_session_id),
        stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id),
        amount_cents = coalesce(p_amount_cents, amount_cents),
        currency = coalesce(p_currency, currency),
        paid_at = case when p_payment_status = 'succeeded' then coalesce(paid_at, now()) else paid_at end
  where id = p_booking_id;

  insert into public.payments (
    booking_id,
    stripe_event_id,
    stripe_payment_intent_id,
    amount_cents,
    currency,
    status
  ) values (
    p_booking_id,
    p_event_id,
    p_payment_intent_id,
    coalesce(p_amount_cents, 0),
    coalesce(p_currency, 'eur'),
    p_payment_status
  ) on conflict (stripe_event_id) do nothing;

  return 'ok';
end;
$$;
grant execute on function public.confirm_booking_payment(uuid, text, text, int, text, text, text) to service_role;

create or replace function public.get_published_classes()
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
    coalesce((select count(*) from public.bookings b where b.class_id = c.id and b.status = 'paid'), 0) as paid_count
  from public.classes c
  where c.is_active = true
  order by c.starts_at asc;
$$;
grant execute on function public.get_published_classes() to anon, authenticated;

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
  select * from public.get_published_classes();
$$;
grant execute on function public.get_published_sessions() to anon, authenticated;

create or replace function public.get_booking_public(p_checkout_session_id text)
returns table (
  booking_id uuid,
  class_id uuid,
  class_title text,
  starts_at timestamptz,
  ends_at timestamptz,
  amount_cents int,
  currency text,
  status text,
  user_email text,
  user_name text
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
    c.starts_at,
    c.ends_at,
    coalesce(b.amount_cents, c.price_cents) as amount_cents,
    coalesce(b.currency, c.currency, 'eur') as currency,
    b.status,
    b.user_email,
    b.user_name
  from public.bookings b
  join public.classes c on c.id = b.class_id
  where b.stripe_checkout_session_id = p_checkout_session_id
  limit 1;
$$;
grant execute on function public.get_booking_public(text) to anon, authenticated;

create or replace function public.get_booking_public_by_id(p_booking_id uuid)
returns table (
  booking_id uuid,
  class_id uuid,
  class_title text,
  starts_at timestamptz,
  ends_at timestamptz,
  amount_cents int,
  currency text,
  status text,
  user_email text,
  user_name text
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
    c.starts_at,
    c.ends_at,
    coalesce(b.amount_cents, c.price_cents) as amount_cents,
    coalesce(b.currency, c.currency, 'eur') as currency,
    b.status,
    b.user_email,
    b.user_name
  from public.bookings b
  join public.classes c on c.id = b.class_id
  where b.id = p_booking_id
  limit 1;
$$;
grant execute on function public.get_booking_public_by_id(uuid) to anon, authenticated;

create or replace function public.cancel_pending_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bookings
    set status = 'cancelled'
  where id = p_booking_id
    and status = 'pending';
end;
$$;
grant execute on function public.cancel_pending_booking(uuid) to anon, authenticated;

-- 6) RLS and policies
alter table if exists public.admin_users enable row level security;
alter table if exists public.classes enable row level security;
alter table if exists public.bookings enable row level security;
alter table if exists public.payments enable row level security;

-- Drop existing policies
do $$
declare rec record;
begin
  for rec in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname='public' and tablename in ('admin_users','classes','bookings','payments')
  loop
    execute format('drop policy if exists %I on public.%I', rec.policyname, rec.tablename);
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

-- Bookings policies (admin only; service_role bypasses)
create policy "Admins read bookings" on public.bookings
  for select using (public.is_admin());
create policy "Admins manage bookings" on public.bookings
  for all using (public.is_admin()) with check (public.is_admin());

-- Payments policies (admin only)
create policy "Admins read payments" on public.payments
  for select using (public.is_admin());
create policy "Admins manage payments" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());
