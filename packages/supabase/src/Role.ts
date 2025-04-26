import { createClient } from "@supabase/supabase-js";

export function adminAuthClient() {
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase environment variables are not set.");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export function clientAuthClient() {
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const supabasePublicKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabasePublicKey) {
    throw new Error("Supabase environment variables are not set.");
  }

  return createClient(supabaseUrl, supabasePublicKey);
}
