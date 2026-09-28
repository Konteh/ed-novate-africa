import { isSupabaseConfigured } from "../supabase/config";
import { localBackend } from "./local";
import { supabaseBackend } from "./supabase";
import type { Backend } from "./types";

/**
 * One decision, made once, from the environment: if Supabase credentials are
 * present the app persists there, otherwise it stays in the browser. No screen
 * needs to know which one it got.
 */
export const backend: Backend = isSupabaseConfigured
  ? supabaseBackend
  : localBackend;

export const usingSupabase = isSupabaseConfigured;

/**
 * Supabase calls can fail for reasons the learner cannot act on — offline,
 * expired session, a bucket that was never created. Losing a click is worse
 * than losing durability, so failures fall back to the browser copy.
 */
export async function withLocalFallback<T>(
  run: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[backend] falling back to local storage", error);
    }
    return fallback();
  }
}

export type { Backend, BackendKind } from "./types";
export { localBackend } from "./local";
