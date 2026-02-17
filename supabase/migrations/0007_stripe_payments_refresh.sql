-- Stripe test-mode enablement and schema alignment for classes/bookings/payments
set check_function_bodies = off;

-- Rename class_sessions -> classes to match simplified model
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'class_sessions'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'classes'
  ) then
    alter table public.class_sessions rename to classes;
  end if;
end
$$;

-- Rename columns to match "classes" shape
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='classes' and column_name='start_time') then
    alter table public.classes rename column start_time to starts_at;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='classes' and column_name='end_time') then
    alter table public.classes rename column end_time to ends_at;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='classes' and column_name='is_published') then
    alter table public.classes rename column is_published to is_active;
  end if;
end
$$;

-- Ensure sensible defaults
alter table if exists public.classes
  alter column currency set default 'eur',
  alter column title set default 'Yoga Class';

-- Bookings table: align naming with requirements
do $$
begin
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
end
$$;

alter table if exists public.bookings
  add column if not exists amount_cents int,
  add column if not exists currency text default 'eur',
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists paid_at timestamptz;

-- Enforce uniqueness on checkout session id for idempotency
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'bookings_stripe_checkout_session_id_key'
  ) then
    alter table public.bookings
      add constraint bookings_stripe_checkout_session_id_key
      unique (stripe_checkout_session_id);
  end if;
end
$$;

-- Payments table additions
alter table if exists public.payments
  add column if not exists stripe_event_id text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payments_stripe_event_id_key'
  ) then
    alter table public.payments add constraint payments_stripe_event_id_key unique (stripe_event_id);
  end if;
end
$$;

-- Indexes for performance
create index if not exists idx_classes_starts_at on public.classes(starts_at);
create index if not exists idx_classes_is_active on public.classes(is_active);
create index if not exists idx_bookings_class_id on public.bookings(class_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_created_at on public.bookings(created_at);
create index if not exists idx_payments_created_at on public.payments(created_at);
create index if not exists idx_payments_status on public.payments(status);

-- Refresh RLS policies for renamed classes table
alter table if exists public.classes enable row level security;

do $$
begin
  if exists (select 1 from pg_policies where tablename='classes' and policyname='Public read active class types') then
    drop policy "Public read active class types" on public.classes;
  end if;
  if exists (select 1 from pg_policies where tablename='classes' and policyname='Admins manage sessions') then
    drop policy "Admins manage sessions" on public.classes;
  end if;
end
$$;

create policy "Public read active classes" on public.classes
  for select using (is_active = true);

create policy "Admins manage classes" on public.classes
  for all using (is_admin()) with check (is_admin());

-- Bookings RLS refresh (keep admin and public create on active classes)
do $$
begin
  if exists (select 1 from pg_policies where tablename='bookings' and policyname='Public create pending bookings on published sessions') then
    drop policy "Public create pending bookings on published sessions" on public.bookings;
  end if;
  if exists (select 1 from pg_policies where tablename='bookings' and policyname='Public create pending bookings on active classes') then
    drop policy "Public create pending bookings on active classes" on public.bookings;
  end if;
  if exists (select 1 from pg_policies where tablename='bookings' and policyname='Admins read all bookings') then
    drop policy "Admins read all bookings" on public.bookings;
  end if;
  if exists (select 1 from pg_policies where tablename='bookings' and policyname='Users read own bookings') then
    drop policy "Users read own bookings" on public.bookings;
  end if;
  if exists (select 1 from pg_policies where tablename='bookings' and policyname='Admins update bookings') then
    drop policy "Admins update bookings" on public.bookings;
  end if;
end
$$;

create policy "Public create pending bookings on active classes" on public.bookings
  for insert
  with check (
    status = 'pending' and
    exists (
      select 1 from public.classes c
      where c.id = class_id and c.is_active = true
    )
  );

create policy "Admins read all bookings" on public.bookings
  for select using (is_admin());

create policy "Users read own bookings" on public.bookings
  for select using (auth.uid() is not null and user_id = auth.uid());

create policy "Admins update bookings" on public.bookings
  for update using (is_admin()) with check (is_admin());

-- Payments policies (admin only)
do $$
begin
  if exists (select 1 from pg_policies where tablename='payments' and policyname='Admins read payments') then
    drop policy "Admins read payments" on public.payments;
  end if;
  if exists (select 1 from pg_policies where tablename='payments' and policyname='Admins manage payments') then
    drop policy "Admins manage payments" on public.payments;
  end if;
end
$$;

create policy "Admins read payments" on public.payments
  for select using (is_admin());

create policy "Admins manage payments" on public.payments
  for all using (is_admin()) with check (is_admin());

-- Updated helper to prevent overbooking and record payments idempotently
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
      )
      values (
        p_booking_id,
        p_event_id,
        p_payment_intent_id,
        coalesce(p_amount_cents, 0),
        coalesce(p_currency, 'eur'),
        'failed'
      )
      on conflict (stripe_event_id) do nothing;
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
  )
  values (
    p_booking_id,
    p_event_id,
    p_payment_intent_id,
    coalesce(p_amount_cents, 0),
    coalesce(p_currency, 'eur'),
    p_payment_status
  )
  on conflict (stripe_event_id) do nothing;

  return 'ok';
end;
$$;

-- Public list of active upcoming classes with paid counts
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
    coalesce((
      select count(*) from public.bookings b
      where b.class_id = c.id and b.status = 'paid'
    ), 0) as paid_count
  from public.classes c
  where c.is_active = true
  order by c.starts_at asc;
$$;

-- Backwards compatibility alias
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

grant execute on function public.get_published_classes() to anon, authenticated;
grant execute on function public.get_published_sessions() to anon, authenticated;

-- Public-safe booking lookup for success page
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

-- Allow cancelling a pending booking after checkout cancellation
create or replace function public.cancel_pending_booking(p_booking_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bookings
    set status = 'cancelled'
  where id = p_booking_id
    and status = 'pending';
  return 'ok';
end;
$$;

grant execute on function public.cancel_pending_booking(uuid) to anon, authenticated;

-- Seed a handful of classes if none exist to ease local testing
insert into public.classes (title, description, starts_at, ends_at, price_cents, currency, capacity, is_active)
select * from (
  values
    ('Morning Flow', 'All-levels vinyasa to start the day', now() + interval '2 day', now() + interval '2 day' + interval '1 hour', 1800, 'eur', 14, true),
    ('Evening Yin', 'Slow, deep stretches for relaxation', now() + interval '4 day', now() + interval '4 day' + interval '75 minutes', 2000, 'eur', 12, true),
    ('Beginner Foundations', 'Learn the basics with alignment cues', now() + interval '6 day', now() + interval '6 day' + interval '1 hour', 1500, 'eur', 20, true)
) as seed(title, description, starts_at, ends_at, price_cents, currency, capacity, is_active)
where not exists (select 1 from public.classes);

