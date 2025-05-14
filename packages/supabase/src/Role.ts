import { createClient } from "@supabase/supabase-js";

export function adminAuthClient() {
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase environment variables are not set.");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}
