-- Classes, bookings, payments, profiles, and supporting policies
-- This migration adds a full schema for class scheduling, bookings, and payments.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles mirror auth.users (one row per auth user)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Class catalog
CREATE TABLE IF NOT EXISTS public.class_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  level text,
  duration_minutes int,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure titles are unique to support ON CONFLICT (title) inserts
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'class_types'
  ) THEN
    -- Remove duplicates keeping the first row
    WITH ranked AS (
      SELECT id, title, row_number() OVER (PARTITION BY title ORDER BY created_at NULLS FIRST, id) AS rn
      FROM public.class_types
    )
    DELETE FROM public.class_types ct
    USING ranked r
    WHERE ct.id = r.id
      AND r.rn > 1;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'class_types_title_unique'
        AND conrelid = 'public.class_types'::regclass
    ) THEN
      ALTER TABLE public.class_types
        ADD CONSTRAINT class_types_title_unique UNIQUE (title);
    END IF;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.class_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_type_id uuid NOT NULL REFERENCES public.class_types(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  timezone text NOT NULL,
  location_name text,
  location_address text,
  is_online boolean NOT NULL DEFAULT false,
  online_join_info text,
  price_cents int NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  capacity int,
  notes text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.class_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  status text NOT NULL CHECK (status IN ('pending','paid','cancelled','refunded')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_cents int NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL CHECK (status IN ('created','succeeded','failed','refunded')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  attended boolean NOT NULL DEFAULT false,
  marked_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_class_sessions_start_time ON public.class_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_session ON public.bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_payments_intent ON public.payments(stripe_payment_intent_id);

-- Helper: admin check based on profiles.role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

-- RLS enablement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Class types policies
CREATE POLICY "Public read active class types" ON public.class_types
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage class types" ON public.class_types
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Class sessions policies
CREATE POLICY "Public read published sessions" ON public.class_sessions
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage sessions" ON public.class_sessions
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Bookings policies
CREATE POLICY "Public create pending bookings on published sessions" ON public.bookings
  FOR INSERT
  WITH CHECK (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM public.class_sessions s
      WHERE s.id = session_id AND s.is_published = true
    )
  );
CREATE POLICY "Admins read all bookings" ON public.bookings
  FOR SELECT USING (is_admin());
CREATE POLICY "Users read own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Admins update bookings" ON public.bookings
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- Payments policies (admin-only; service role bypasses RLS)
CREATE POLICY "Admins read payments" ON public.payments
  FOR SELECT USING (is_admin());
CREATE POLICY "Admins manage payments" ON public.payments
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Attendance policies
CREATE POLICY "Admins manage attendance" ON public.attendance
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Capacity-safe payment confirmation
CREATE OR REPLACE FUNCTION public.confirm_booking_payment(
  p_booking_id uuid,
  p_checkout_session_id text,
  p_payment_intent_id text,
  p_amount_cents int,
  p_currency text,
  p_payment_status text
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id uuid;
  v_capacity int;
  v_paid_count int;
  v_status text := 'failed';
BEGIN
  -- Lock the session row to prevent overbooking
  SELECT b.session_id INTO v_session_id FROM public.bookings b WHERE b.id = p_booking_id FOR UPDATE;
  IF v_session_id IS NULL THEN
    RETURN 'booking_not_found';
  END IF;

  SELECT s.capacity INTO v_capacity FROM public.class_sessions s WHERE s.id = v_session_id FOR UPDATE;

  SELECT COUNT(*) INTO v_paid_count
  FROM public.bookings b
  WHERE b.session_id = v_session_id AND b.status = 'paid';

  IF v_capacity IS NOT NULL AND v_paid_count >= v_capacity THEN
    UPDATE public.bookings SET status = 'cancelled' WHERE id = p_booking_id;
    UPDATE public.payments
      SET status = 'failed', stripe_checkout_session_id = p_checkout_session_id, stripe_payment_intent_id = p_payment_intent_id
      WHERE booking_id = p_booking_id;
    RETURN 'capacity_full';
  END IF;

  UPDATE public.bookings
    SET status = CASE WHEN p_payment_status = 'succeeded' THEN 'paid' ELSE 'cancelled' END
  WHERE id = p_booking_id;

  INSERT INTO public.payments (booking_id, stripe_checkout_session_id, stripe_payment_intent_id, amount_cents, currency, status)
  VALUES (p_booking_id, p_checkout_session_id, p_payment_intent_id, p_amount_cents, COALESCE(p_currency, 'eur'), p_payment_status)
  ON CONFLICT (booking_id) DO UPDATE
    SET stripe_checkout_session_id = EXCLUDED.stripe_checkout_session_id,
        stripe_payment_intent_id = EXCLUDED.stripe_payment_intent_id,
        amount_cents = EXCLUDED.amount_cents,
        currency = EXCLUDED.currency,
        status = EXCLUDED.status;

  RETURN 'ok';
END;
$$;

-- Public view of published sessions with paid counts (security definer to bypass bookings RLS)
CREATE OR REPLACE FUNCTION public.get_published_sessions()
RETURNS TABLE (
  id uuid,
  class_type_id uuid,
  start_time timestamptz,
  end_time timestamptz,
  timezone text,
  location_name text,
  location_address text,
  is_online boolean,
  online_join_info text,
  price_cents int,
  currency text,
  capacity int,
  notes text,
  is_published boolean,
  created_at timestamptz,
  class_title text,
  class_description text,
  class_level text,
  class_duration_minutes int,
  paid_count int
) AS $$
  SELECT
    s.id,
    s.class_type_id,
    s.start_time,
    s.end_time,
    s.timezone,
    s.location_name,
    s.location_address,
    s.is_online,
    s.online_join_info,
    s.price_cents,
    s.currency,
    s.capacity,
    s.notes,
    s.is_published,
    s.created_at,
    ct.title AS class_title,
    ct.description AS class_description,
    ct.level AS class_level,
    ct.duration_minutes AS class_duration_minutes,
    COALESCE((
      SELECT COUNT(*) FROM public.bookings b WHERE b.session_id = s.id AND b.status = 'paid'
    ), 0) AS paid_count
  FROM public.class_sessions s
  JOIN public.class_types ct ON ct.id = s.class_type_id
  WHERE s.is_published = true AND ct.is_active = true
  ORDER BY s.start_time ASC;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_published_sessions() TO anon, authenticated;

-- Seed data for quick start (idempotent-ish; avoid duplicates by title)
INSERT INTO public.class_types (title, description, level, duration_minutes)
VALUES
  ('Vinyasa Flow', 'Dynamic flow to build heat and focus', 'All Levels', 60),
  ('Yin Yoga', 'Slow, deep stretches for relaxation', 'Gentle', 75),
  ('Beginner Foundations', 'Learn the basics with alignment cues', 'Beginner', 60)
ON CONFLICT (title) DO NOTHING;

-- Seed sessions linked to seeded class types
WITH ct AS (
  SELECT id, title FROM public.class_types
)
INSERT INTO public.class_sessions (
  class_type_id, start_time, end_time, timezone, location_name, location_address,
  is_online, online_join_info, price_cents, currency, capacity, notes, is_published
) VALUES
  ((SELECT id FROM ct WHERE title = 'Vinyasa Flow'), (now() + interval '2 day')::timestamptz, (now() + interval '2 day' + interval '1 hour')::timestamptz, 'Europe/Dublin', 'Studio A', '123 Yoga St, Dublin', false, null, 1800, 'eur', 14, 'Bring water and towel', true),
  ((SELECT id FROM ct WHERE title = 'Yin Yoga'), (now() + interval '4 day' + interval '18 hour')::timestamptz, (now() + interval '4 day' + interval '19 hour' + interval '15 minute')::timestamptz, 'Europe/Dublin', 'Studio B', '123 Yoga St, Dublin', false, null, 2000, 'eur', 12, 'Mats and bolsters provided', true),
  ((SELECT id FROM ct WHERE title = 'Beginner Foundations'), (now() + interval '6 day' + interval '9 hour')::timestamptz, (now() + interval '6 day' + interval '10 hour')::timestamptz, 'Europe/Dublin', null, null, true, 'Zoom link sent after booking', 1500, 'eur', 20, 'Great for first-timers', true)
ON CONFLICT DO NOTHING;
