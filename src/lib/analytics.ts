/**
 * Analytics and conversion tracking utilities
 * Integrates with Google Analytics 4 for event tracking
 */

// Type for gtag events
type GtagEvent = {
  event_category?: string;
  event_label?: string;
  value?: number;
  currency?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    item_category?: string;
    price?: number;
    quantity?: number;
  }>;
  [key: string]: unknown;
};

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(eventName: string, params?: GtagEvent) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params as Record<string, string>);
  }
}

/**
 * Track page view (for SPA navigation)
 */
export function trackPageView(path: string, title?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  }
}

// Conversion Events

/**
 * Track when user starts a booking
 */
export function trackBeginCheckout(packageId: string, packageName: string, price: number) {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value: price,
    items: [{
      item_id: packageId,
      item_name: packageName,
      price,
      quantity: 1,
    }],
  });
}

/**
 * Track successful booking completion
 */
export function trackPurchase(
  bookingId: string,
  packageId: string,
  packageName: string,
  price: number,
  vendorName?: string
) {
  trackEvent('purchase', {
    transaction_id: bookingId,
    currency: 'USD',
    value: price,
    items: [{
      item_id: packageId,
      item_name: packageName,
      item_category: vendorName || 'Event Service',
      price,
      quantity: 1,
    }],
  });
}

/**
 * Track when user signs up
 */
export function trackSignUp(method: 'email' | 'google' | 'magic_link') {
  trackEvent('sign_up', {
    event_category: 'engagement',
    method,
  });
}

/**
 * Track when vendor completes onboarding
 */
export function trackVendorOnboarding(step: string) {
  trackEvent('vendor_onboarding', {
    event_category: 'conversion',
    event_label: step,
  });
}

/**
 * Track package view
 */
export function trackViewItem(packageId: string, packageName: string, price: number, category?: string) {
  trackEvent('view_item', {
    currency: 'USD',
    value: price,
    items: [{
      item_id: packageId,
      item_name: packageName,
      item_category: category || 'Event Service',
      price,
      quantity: 1,
    }],
  });
}

/**
 * Track search query
 */
export function trackSearch(searchTerm: string, category?: string, location?: string) {
  trackEvent('search', {
    search_term: searchTerm,
    event_category: 'discovery',
    event_label: category || 'all',
    ...(location && { location }),
  });
}

/**
 * Track lead generation (contact vendor, message sent)
 */
export function trackGenerateLead(vendorId: string, vendorName: string, source: string) {
  trackEvent('generate_lead', {
    event_category: 'conversion',
    event_label: vendorName,
    vendor_id: vendorId,
    source,
  });
}

/**
 * Track content share
 */
export function trackShare(contentType: 'package' | 'vendor' | 'blog', itemId: string, method: string) {
  trackEvent('share', {
    content_type: contentType,
    item_id: itemId,
    method,
  });
}

/**
 * Track CTA button clicks
 */
export function trackCTAClick(ctaName: string, location: string) {
  trackEvent('cta_click', {
    event_category: 'engagement',
    event_label: ctaName,
    location,
  });
}
