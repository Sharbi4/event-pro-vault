// Auth Intent Types and Utilities
// Manages intent preservation across auth flow

export type AuthIntent = 
  | 'EVENT_PRO_ONBOARDING'
  | 'MARKET_ONBOARDING'
  | 'BOOK_PACKAGE'
  | 'BOOK_SLOT'
  | 'DASHBOARD'
  | 'GENERAL';

export type ProfileType = 'EVENT_PRO' | 'MARKET_SPACE';

export interface AuthIntentPayload {
  intent: AuthIntent;
  profileType?: ProfileType;
  returnTo?: string;
  payload?: {
    packageId?: string;
    marketId?: string;
    slotTypeId?: string;
    inventoryId?: string;
    draftId?: string;
    bookingData?: Record<string, unknown>;
  };
}

const AUTH_INTENT_KEY = 'auth_intent';
const BOOKING_DRAFT_KEY = 'booking_draft';

// Store intent in sessionStorage
export function setAuthIntent(intent: AuthIntentPayload): void {
  try {
    sessionStorage.setItem(AUTH_INTENT_KEY, JSON.stringify(intent));
  } catch (e) {
    console.error('Failed to store auth intent:', e);
  }
}

// Get intent from sessionStorage
export function getAuthIntent(): AuthIntentPayload | null {
  try {
    const stored = sessionStorage.getItem(AUTH_INTENT_KEY);
    if (stored) {
      return JSON.parse(stored) as AuthIntentPayload;
    }
  } catch (e) {
    console.error('Failed to read auth intent:', e);
  }
  return null;
}

// Clear intent from sessionStorage
export function clearAuthIntent(): void {
  try {
    sessionStorage.removeItem(AUTH_INTENT_KEY);
  } catch (e) {
    console.error('Failed to clear auth intent:', e);
  }
}

// Build auth URL with intent params
export function buildAuthUrl(intent: AuthIntentPayload): string {
  const params = new URLSearchParams();
  
  // Determine base path based on intent type
  let basePath = '/auth';
  if (intent.intent === 'EVENT_PRO_ONBOARDING') {
    basePath = '/auth/pro';
  } else if (intent.intent === 'BOOK_PACKAGE' || intent.intent === 'BOOK_SLOT') {
    basePath = '/auth/booking';
  }
  
  // Add params for booking flow
  if (intent.payload?.packageId) {
    params.set('packageId', intent.payload.packageId);
  }
  
  if (intent.payload?.marketId) {
    params.set('marketId', intent.payload.marketId);
  }
  
  if (intent.payload?.draftId) {
    params.set('draftId', intent.payload.draftId);
  }
  
  if (intent.returnTo) {
    params.set('returnTo', intent.returnTo);
  }
  
  // Also store in sessionStorage for redundancy
  setAuthIntent(intent);
  
  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

// Parse intent from URL params
export function parseAuthIntentFromUrl(searchParams: URLSearchParams): AuthIntentPayload | null {
  const intent = searchParams.get('intent') as AuthIntent | null;
  
  if (!intent) {
    // Check for legacy returnTo param
    const returnTo = searchParams.get('returnTo');
    if (returnTo) {
      return {
        intent: 'GENERAL',
        returnTo,
      };
    }
    return null;
  }
  
  return {
    intent,
    profileType: searchParams.get('profileType') as ProfileType | undefined,
    returnTo: searchParams.get('returnTo') || undefined,
    payload: {
      packageId: searchParams.get('packageId') || undefined,
      marketId: searchParams.get('marketId') || undefined,
      draftId: searchParams.get('draftId') || undefined,
    },
  };
}

// Booking draft management
export interface BookingDraft {
  id: string;
  type: 'package' | 'slot';
  packageId?: string;
  marketId?: string;
  slotTypeId?: string;
  inventoryId?: string;
  data: Record<string, unknown>;
  createdAt: number;
}

export function saveBookingDraft(draft: Omit<BookingDraft, 'id' | 'createdAt'>): string {
  const id = `draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const fullDraft: BookingDraft = {
    ...draft,
    id,
    createdAt: Date.now(),
  };
  
  try {
    sessionStorage.setItem(`${BOOKING_DRAFT_KEY}_${id}`, JSON.stringify(fullDraft));
  } catch (e) {
    console.error('Failed to save booking draft:', e);
  }
  
  return id;
}

export function getBookingDraft(draftId: string): BookingDraft | null {
  try {
    const stored = sessionStorage.getItem(`${BOOKING_DRAFT_KEY}_${draftId}`);
    if (stored) {
      return JSON.parse(stored) as BookingDraft;
    }
  } catch (e) {
    console.error('Failed to read booking draft:', e);
  }
  return null;
}

export function clearBookingDraft(draftId: string): void {
  try {
    sessionStorage.removeItem(`${BOOKING_DRAFT_KEY}_${draftId}`);
  } catch (e) {
    console.error('Failed to clear booking draft:', e);
  }
}

// Helper to redirect to auth with intent
export function redirectToAuth(intent: AuthIntentPayload): string {
  return buildAuthUrl(intent);
}
