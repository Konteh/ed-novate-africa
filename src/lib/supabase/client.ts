"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

export type TypedSupabaseClient = SupabaseClient<Database>;

let client: TypedSupabaseClient | null = null;

/**
 * Returns `null` when no credentials are present, which is the signal the rest
 * of the app uses to stay in demo mode rather than throwing at import time.
 */
export function getSupabaseClient(): TypedSupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  client ??= createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return client;
}
