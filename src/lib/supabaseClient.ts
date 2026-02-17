import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ClassSession {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  price_cents: number;
  currency: string;
  capacity: number | null;
  is_active: boolean;
  created_at: string;
  remaining_spots?: number | null;
  paid_count?: number | null;
}

export type PublishedSession = ClassSession;

export interface BookingPublic {
  id: string;
  class_id: string;
  user_id?: string | null;
  user_name: string | null;
  user_email: string;
  user_phone?: string | null;
  status: "pending" | "paid" | "cancelled" | "refunded";
  created_at: string;
  amount_cents?: number | null;
  currency?: string | null;
  manage_token?: string | null;
}

export interface BlogPost {
  id: string;
  author_id?: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  hero_image_url: string | null;
  image_urls: string[] | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  tags?: string[] | null;
}

// Legacy types kept for existing admin UI compatibility
export interface Booking {
  id: string;
  class_id: string;
  user_id?: string | null;
  user_name: string | null;
  user_email: string;
  user_phone: string | null;
  status: "pending" | "paid" | "cancelled" | "refunded";
  created_at: string;
  manage_token?: string | null;
}

