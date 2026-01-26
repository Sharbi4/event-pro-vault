/**
 * Utility to mask phone numbers and email addresses in text
 * to keep transactions within the platform
 */

// Phone patterns: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890, +1 123 456 7890
const PHONE_PATTERNS = [
  /(\+?1?\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/g,
  /\b\d{10,11}\b/g,
];

// Email pattern
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

// URL patterns for external communication
const URL_PATTERNS = [
  /https?:\/\/[^\s]+/gi,
  /www\.[^\s]+/gi,
];

// Social media handles
const SOCIAL_PATTERNS = [
  /@[a-zA-Z0-9_]{1,30}/g, // Twitter/Instagram handles
];

export interface MaskResult {
  maskedText: string;
  hasMaskedContent: boolean;
  maskedTypes: ('phone' | 'email' | 'url' | 'social')[];
}

export function maskContactInfo(text: string): MaskResult {
  if (!text) {
    return { maskedText: text, hasMaskedContent: false, maskedTypes: [] };
  }

  let maskedText = text;
  const maskedTypes: ('phone' | 'email' | 'url' | 'social')[] = [];

  // Mask emails
  if (EMAIL_PATTERN.test(maskedText)) {
    maskedText = maskedText.replace(EMAIL_PATTERN, '[email hidden]');
    maskedTypes.push('email');
  }

  // Mask phone numbers
  for (const pattern of PHONE_PATTERNS) {
    const matches = maskedText.match(pattern);
    if (matches) {
      // Filter out false positives (numbers that are too short or likely not phone numbers)
      const validMatches = matches.filter((match) => {
        const digitsOnly = match.replace(/\D/g, '');
        return digitsOnly.length >= 10 && digitsOnly.length <= 15;
      });
      
      if (validMatches.length > 0) {
        for (const match of validMatches) {
          maskedText = maskedText.replace(match, '[phone hidden]');
        }
        if (!maskedTypes.includes('phone')) {
          maskedTypes.push('phone');
        }
      }
    }
  }

  // Mask URLs (except platform URLs)
  for (const pattern of URL_PATTERNS) {
    if (pattern.test(maskedText)) {
      maskedText = maskedText.replace(pattern, (url) => {
        // Allow platform URLs
        if (url.includes('eventpros.') || url.includes('lovable.app')) {
          return url;
        }
        return '[link hidden]';
      });
      if (!maskedTypes.includes('url')) {
        maskedTypes.push('url');
      }
    }
  }

  // Reset regex lastIndex
  EMAIL_PATTERN.lastIndex = 0;
  for (const pattern of PHONE_PATTERNS) {
    pattern.lastIndex = 0;
  }
  for (const pattern of URL_PATTERNS) {
    pattern.lastIndex = 0;
  }

  return {
    maskedText,
    hasMaskedContent: maskedTypes.length > 0,
    maskedTypes,
  };
}

/**
 * Check if text contains contact info without masking
 */
export function containsContactInfo(text: string): boolean {
  if (!text) return false;

  // Check for emails
  if (EMAIL_PATTERN.test(text)) {
    EMAIL_PATTERN.lastIndex = 0;
    return true;
  }

  // Check for phone numbers
  for (const pattern of PHONE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      const validMatches = matches.filter((match) => {
        const digitsOnly = match.replace(/\D/g, '');
        return digitsOnly.length >= 10 && digitsOnly.length <= 15;
      });
      if (validMatches.length > 0) {
        return true;
      }
    }
  }

  return false;
}
