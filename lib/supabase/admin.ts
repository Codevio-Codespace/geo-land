import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './config';

export function hasServiceRole(): boolean {
  return Boolean(SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function supabaseAdmin(): SupabaseClient {
  if (!hasServiceRole()) {
    throw new Error(
      'Supabase service role is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
