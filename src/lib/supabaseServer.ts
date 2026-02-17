import { createClient, SupabaseClient } from "@supabase/supabase-js";

let serverClient: SupabaseClient | null = null;

export const getSupabaseServerClient = () => {
  if (typeof window !== "undefined") {
    throw new Error("supabaseServer client should only be used in server contexts.");
  }

  if (!serverClient) {
    const supabaseUrl =
      process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase server environment variables.");
    }

    serverClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return serverClient;
};
