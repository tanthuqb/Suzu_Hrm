"use client";

import { supabase } from "~/app/libs/supbase-Client";

export const useSupabaseClient = () => {
  return supabase;
};
