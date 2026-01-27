/**
 * Production-ready analytics for EventPro
 * Tracks funnel, attribution, and supply/demand gaps
 * Privacy-safe: only stores city/state, no full addresses
 */

import { supabase } from '@/integrations/supabase/client';

// Session management
const SESSION_KEY = 'ep_session_id';
const UTM_KEY = 'ep_utms';
const REF_KEY = 'ep_referral';

/**
 * Get or create a stable session ID
 */
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Parse and persist UTM parameters from URL (only once per session)
 */
export function parseAndStoreUTMs(): Record<string, string> {
  // Check if already parsed
  const stored = localStorage.getItem(UTM_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Continue to re-parse
    }
  }

  const params = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  utmKeys.forEach(key => {
    const value = params.get(key);
    if (value) {
      utms[key] = value;
    }
  });

  // Store if we found any
  if (Object.keys(utms).length > 0) {
    localStorage.setItem(UTM_KEY, JSON.stringify(utms));
  }

  return utms;
}

/**
 * Get stored UTMs
 */
export function getStoredUTMs(): Record<string, string> {
  const stored = localStorage.getItem(UTM_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Parse and store referral code from URL
 */
export function parseAndStoreReferral(): string | null {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  
  if (ref) {
    localStorage.setItem(REF_KEY, ref);
    return ref;
  }
  
  return localStorage.getItem(REF_KEY);
}

/**
 * Get stored referral code
 */
export function getStoredReferral(): string | null {
  return localStorage.getItem(REF_KEY);
}

/**
 * Clear referral after use (e.g., after signup)
 */
export function clearReferral(): void {
  localStorage.removeItem(REF_KEY);
}

// Event debouncing to prevent duplicates
const recentEvents = new Map<string, number>();
const DEBOUNCE_MS = 2000;

function shouldDebounce(eventKey: string): boolean {
  const now = Date.now();
  const lastTime = recentEvents.get(eventKey);
  
  if (lastTime && now - lastTime < DEBOUNCE_MS) {
    return true;
  }
  
  recentEvents.set(eventKey, now);
  return false;
}

// Types
export interface TrackingPayload {
  city?: string;
  state?: string;
  category?: string;
  package_id?: string;
  pro_id?: string;
  lead_id?: string;
  referral_code?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Track an analytics event
 * Automatically includes session, UTMs, user, and page info
 */
export async function track(eventName: string, payload: TrackingPayload = {}): Promise<void> {
  try {
    // Debounce duplicate events
    const debounceKey = `${eventName}:${payload.package_id || ''}:${payload.category || ''}`;
    if (shouldDebounce(debounceKey)) {
      return;
    }

    const sessionId = getSessionId();
    const utms = getStoredUTMs();
    const referralCode = payload.referral_code || getStoredReferral();
    
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    const event = {
      event_name: eventName,
      session_id: sessionId,
      user_id: user?.id || null,
      page_path: window.location.pathname,
      referrer: document.referrer || null,
      utm_source: utms.utm_source || null,
      utm_medium: utms.utm_medium || null,
      utm_campaign: utms.utm_campaign || null,
      utm_term: utms.utm_term || null,
      utm_content: utms.utm_content || null,
      city: payload.city || null,
      state: payload.state || null,
      category: payload.category || null,
      package_id: payload.package_id || null,
      pro_id: payload.pro_id || null,
      lead_id: payload.lead_id || null,
      referral_code: referralCode || null,
      metadata: (payload.metadata || {}) as unknown as Record<string, unknown>,
    };

    // Fire and forget - don't block UI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from('analytics_events').insert([event as any]).then(({ error }) => {
      if (error) {
        console.warn('[Analytics] Failed to track event:', eventName, error.message);
      }
    });
  } catch (err) {
    // Silent fail - analytics should never break the app
    console.warn('[Analytics] Error tracking event:', eventName, err);
  }
}

// ============================================
// Convenience functions for specific events
// ============================================

// SEARCH EVENTS
export function trackSearchPerformed(params: {
  category?: string;
  city?: string;
  state?: string;
  date?: string;
  filters?: Record<string, unknown>;
}) {
  track('search_performed', {
    category: params.category,
    city: params.city,
    state: params.state,
    metadata: {
      date: params.date,
      filters: params.filters,
    },
  });
}

export function trackResultsViewed(params: {
  resultsCount: number;
  category?: string;
  city?: string;
  state?: string;
}) {
  track('results_viewed', {
    category: params.category,
    city: params.city,
    state: params.state,
    metadata: {
      results_count: params.resultsCount,
    },
  });
}

export function trackNoMatchShown(params: {
  category?: string;
  city?: string;
  state?: string;
  date?: string;
}) {
  track('no_match_shown', {
    category: params.category,
    city: params.city,
    state: params.state,
    metadata: {
      date: params.date,
    },
  });
}

// GROWTH EVENTS
export function trackLeadFormOpened(params: {
  category?: string;
  city?: string;
  state?: string;
}) {
  track('lead_form_opened', {
    category: params.category,
    city: params.city,
    state: params.state,
  });
}

export function trackLeadSubmitted(params: {
  leadId: string;
  category?: string;
  city?: string;
  state?: string;
}) {
  track('lead_submitted', {
    lead_id: params.leadId,
    category: params.category,
    city: params.city,
    state: params.state,
  });
}

export function trackInviteModalOpened(params: {
  category?: string;
  city?: string;
}) {
  track('invite_modal_opened', {
    category: params.category,
    city: params.city,
  });
}

export function trackInviteCreated(referralCode: string) {
  track('invite_created', {
    referral_code: referralCode,
  });
}

export function trackInviteShared(platform: 'sms' | 'email' | 'twitter' | 'native' | 'copy', referralCode: string) {
  track('invite_shared', {
    referral_code: referralCode,
    metadata: {
      platform,
    },
  });
}

// MARKETPLACE EVENTS
export function trackPackageViewed(params: {
  packageId: string;
  proId: string;
  category?: string;
  city?: string;
}) {
  track('package_viewed', {
    package_id: params.packageId,
    pro_id: params.proId,
    category: params.category,
    city: params.city,
  });
}

export function trackBookingStarted(params: {
  packageId: string;
  proId?: string;
}) {
  track('booking_started', {
    package_id: params.packageId,
    pro_id: params.proId,
  });
}

export function trackBookingCompleted(params: {
  bookingId: string;
  packageId?: string;
  isRequest?: boolean;
}) {
  track(params.isRequest ? 'booking_requested' : 'booking_completed', {
    package_id: params.packageId,
    metadata: {
      booking_id: params.bookingId,
    },
  });
}

export function trackBookingFailed(params: {
  packageId: string;
  errorCode?: string;
  reason?: string;
}) {
  track('booking_failed', {
    package_id: params.packageId,
    metadata: {
      error_code: params.errorCode,
      reason: params.reason,
    },
  });
}

// AUTH EVENTS
export function trackSignupStarted(source?: string) {
  track('signup_started', {
    metadata: { source },
  });
}

export function trackSignupCompleted(userId?: string) {
  const utms = getStoredUTMs();
  const referralCode = getStoredReferral();
  
  track('signup_completed', {
    referral_code: referralCode || undefined,
    metadata: {
      user_id: userId,
      ...utms,
    },
  });
}

// Initialize on page load
export function initAnalytics(): void {
  // Parse UTMs and referral on load
  parseAndStoreUTMs();
  parseAndStoreReferral();
}
