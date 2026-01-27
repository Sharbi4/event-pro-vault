import { useState, useEffect, useCallback } from 'react';

export type CookieCategory = 'necessary' | 'analytics' | 'marketing';

export interface CookiePreferences {
  necessary: boolean; // Always true, can't be disabled
  analytics: boolean;
  marketing: boolean;
  consentGiven: boolean;
  consentDate: string | null;
}

const CONSENT_STORAGE_KEY = 'cookie-consent-preferences';

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  consentGiven: false,
  consentDate: null,
};

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setPreferences(parsed);
      }
    } catch (e) {
      console.error('Error loading cookie preferences:', e);
    }
    setIsLoaded(true);
  }, []);

  // Apply consent to Google Analytics
  useEffect(() => {
    if (!isLoaded) return;

    // Update Google Analytics consent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: preferences.analytics ? 'granted' : 'denied',
        ad_storage: preferences.marketing ? 'granted' : 'denied',
        ad_user_data: preferences.marketing ? 'granted' : 'denied',
        ad_personalization: preferences.marketing ? 'granted' : 'denied',
      });
    }
  }, [preferences, isLoaded]);

  const savePreferences = useCallback((newPreferences: CookiePreferences) => {
    const prefsWithDate = {
      ...newPreferences,
      necessary: true, // Always true
      consentGiven: true,
      consentDate: new Date().toISOString(),
    };
    
    setPreferences(prefsWithDate);
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefsWithDate));
  }, []);

  const acceptAll = useCallback(() => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      consentGiven: true,
      consentDate: new Date().toISOString(),
    });
  }, [savePreferences]);

  const rejectNonEssential = useCallback(() => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      consentGiven: true,
      consentDate: new Date().toISOString(),
    });
  }, [savePreferences]);

  const updatePreference = useCallback((category: CookieCategory, enabled: boolean) => {
    if (category === 'necessary') return; // Can't disable necessary cookies
    
    savePreferences({
      ...preferences,
      [category]: enabled,
    });
  }, [preferences, savePreferences]);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setPreferences(defaultPreferences);
  }, []);

  return {
    preferences,
    isLoaded,
    showBanner: isLoaded && !preferences.consentGiven,
    acceptAll,
    rejectNonEssential,
    updatePreference,
    savePreferences,
    resetConsent,
  };
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: Record<string, string>) => void;
    dataLayer: unknown[];
  }
}
