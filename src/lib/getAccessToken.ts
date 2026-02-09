import { supabase } from '@/integrations/supabase/client';

/**
 * Returns a user access token suitable for calling protected backend functions.
 * If the session is close to expiring, it attempts a refresh.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session?.access_token) return null;

  const expiresAtMs = (session.expires_at ?? 0) * 1000;

  // If expiring soon, refresh before using.
  if (expiresAtMs && expiresAtMs < Date.now() + 60_000) {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    if (!error && refreshed.session?.access_token) {
      return refreshed.session.access_token;
    }
  }

  return session.access_token;
}
