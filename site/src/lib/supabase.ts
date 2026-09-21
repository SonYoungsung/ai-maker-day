import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// env 값이 있으면 Supabase 클라이언트를, 없으면 null 을 반환한다.
// null 이면 store.ts 가 localStorage 모드로 동작한다.
let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  cached = url && key ? createClient(url, key) : null;
  return cached;
}

export const SESSION_CODE = import.meta.env.VITE_SESSION_CODE || null;
