/**
 * Supabase is optional. With no credentials the app runs entirely in the
 * browser against localStorage, which is what makes the hosted demo work for
 * anyone who opens it. Drop a URL and anon key into `.env.local` and the same
 * screens start reading and writing real rows and files instead.
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const AVATAR_BUCKET = "avatars";
export const EVIDENCE_BUCKET = "evidence";

/** Matches the bucket limits set in `supabase/migrations/0001_init.sql`. */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const EVIDENCE_MAX_BYTES = 25 * 1024 * 1024;

export const AVATAR_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];
