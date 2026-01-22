import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import {
  AuthIntentPayload,
  getAuthIntent,
  parseAuthIntentFromUrl,
  setAuthIntent,
  clearAuthIntent,
} from '@/lib/authIntent';

export function useAuthIntent() {
  const [searchParams] = useSearchParams();

  // Get intent from URL params first, then fall back to sessionStorage
  const intent = useMemo((): AuthIntentPayload | null => {
    const urlIntent = parseAuthIntentFromUrl(searchParams);
    if (urlIntent) {
      // Sync to sessionStorage
      setAuthIntent(urlIntent);
      return urlIntent;
    }
    return getAuthIntent();
  }, [searchParams]);

  return {
    intent,
    setIntent: setAuthIntent,
    clearIntent: clearAuthIntent,
  };
}
