/**
 * SEO Configuration for EventPro by Vendibook
 * Centralized SEO settings and metadata generators
 */

export const SEO_CONFIG = {
  siteName: 'EventPro by Vendibook',
  baseUrl: 'https://event-pro-vault.lovable.app',
  defaultImage: 'https://event-pro-vault.lovable.app/favicon.png',
  themeColor: '#1a1a2e', // Dark shine CTA color
  twitterHandle: '@eventpro',
  
  // Contact info for structured data
  contact: {
    email: 'support@vendibook.com',
    phone: '1-877-883-6342',
  },
  
  // Primary keywords (food & beverage focused)
  keywords: [
    'book a food truck',
    'food truck catering',
    'mobile catering',
    'private chef hire',
    'mobile bartender',
    'mobile bar service',
    'cottage baker',
    'mobile coffee cart',
    'ice cream truck rental',
    'food vendor booking',
  ],
};

/**
 * Generate page-specific SEO metadata
 */
export function generatePageSEO(page: string, dynamicData?: Record<string, string>) {
  const { siteName, baseUrl } = SEO_CONFIG;
  
  const pages: Record<string, { title: string; description: string; canonical: string; noIndex?: boolean }> = {
    // Public pages
    home: {
      title: `${siteName} | Book Food Trucks, Caterers & Mobile Bartenders`,
      description: 'Book food trucks, caterers, mobile bartenders, bakers and dessert vendors for your next event — search by date, time, and location.',
      canonical: baseUrl,
    },
    learn: {
      title: `How EventPro Works | ${siteName}`,
      description: 'Learn how to book available event packages or list your services. Set availability, choose Instant Book or requests, and get paid securely.',
      canonical: `${baseUrl}/learn`,
    },
    learnEventPros: {
      title: `For Event Pros — Get Booked Faster | ${siteName}`,
      description: 'Create packages with real-time availability. Get discovered by date and time. Accept Instant Book or Request to Book. Secure payouts via Stripe.',
      canonical: `${baseUrl}/learn/event-pros`,
    },
    learnMarkets: {
      title: `For Market Managers — Fill Vendor Spots | ${siteName}`,
      description: 'Create slot types, post market days, and let vendors reserve instantly. Show remaining spots to drive faster bookings.',
      canonical: `${baseUrl}/learn/markets`,
    },
    browse: {
      title: dynamicData?.category
        ? `Book ${dynamicData.category} Near You | ${siteName}`
        : `Find Food Trucks & Mobile Food Vendors | ${siteName}`,
      description: dynamicData?.category
        ? `Find available ${dynamicData.category} packages for your date and time. Compare pricing, travel range, and book online or pay in cash.`
        : 'Search food trucks, caterers, mobile bartenders, bakers and beverage carts by date, time, and location. Real-time availability.',
      canonical: `${baseUrl}/browse`,
    },
    discover: {
      title: dynamicData?.category && dynamicData?.city && dynamicData?.date
        ? `Available ${dynamicData.category} in ${dynamicData.city} on ${dynamicData.date} | ${siteName}`
        : `Find Available Event Services | ${siteName}`,
      description: dynamicData?.category && dynamicData?.city
        ? `See ${dynamicData.category} packages available in ${dynamicData.city}. Book instantly or request to book—clear pricing and travel rules.`
        : 'Search event services by date, time, and location. Book with confidence using real-time availability.',
      canonical: `${baseUrl}/browse`,
    },
    faq: {
      title: `FAQ | ${siteName}`,
      description: 'Answers about booking packages, cancellations, refunds, deposits, fees, and payouts on EventPro by Vendibook.',
      canonical: `${baseUrl}/faq`,
    },
    support: {
      title: `Support | ${siteName}`,
      description: 'Get help with bookings, refunds, payouts, and account access. Email support@vendibook.com or call 1-877-883-6342.',
      canonical: `${baseUrl}/support`,
    },
    contact: {
      title: `Contact Us | ${siteName}`,
      description: 'Have a question or need help? Contact the EventPro by Vendibook team. We typically respond within 24 hours.',
      canonical: `${baseUrl}/contact`,
    },
    becomePro: {
      title: `Become an Event Pro | ${siteName}`,
      description: 'Join thousands of event professionals. Create your profile, set availability, and start getting booked for events today. Free to list.',
      canonical: `${baseUrl}/become-a-pro`,
    },
    blog: {
      title: `Blog — Event Planning Tips & Insights | ${siteName}`,
      description: 'Expert tips for planning events and growing your event business. Guides for bookers and Event Pros on the EventPro marketplace.',
      canonical: `${baseUrl}/blog`,
    },
    markets: {
      title: `Browse Markets & Vendor Spots | ${siteName}`,
      description: 'Find and reserve vendor spots at farmers markets, food truck rallies, craft fairs, and pop-up events. Real-time availability.',
      canonical: `${baseUrl}/markets`,
    },
    
    // Private pages - noIndex
    auth: {
      title: `Sign In | ${siteName}`,
      description: 'Sign in or create an account to book event services or manage your listings.',
      canonical: `${baseUrl}/auth`,
      noIndex: true,
    },
    dashboard: {
      title: `Dashboard | ${siteName}`,
      description: 'Manage your bookings, messages, and account settings.',
      canonical: `${baseUrl}/dashboard`,
      noIndex: true,
    },
    vendorDashboard: {
      title: `Event Pro Dashboard | ${siteName}`,
      description: 'Manage your packages, availability, bookings, and payouts.',
      canonical: `${baseUrl}/vendor-dashboard`,
      noIndex: true,
    },
    onboarding: {
      title: `Complete Your Profile | ${siteName}`,
      description: 'Finish setting up your Event Pro profile to start receiving bookings.',
      canonical: `${baseUrl}/eventpro-onboarding`,
      noIndex: true,
    },
    bookingSuccess: {
      title: `Booking Confirmed | ${siteName}`,
      description: 'Your booking has been confirmed.',
      canonical: `${baseUrl}/booking-success`,
      noIndex: true,
    },
  };
  
  return pages[page] || pages.home;
}

/**
 * Generate dynamic SEO for package pages
 */
export function generatePackageSEO(pkg: {
  name: string;
  description?: string;
  price?: number;
  city?: string;
  vendorName?: string;
  image?: string;
  duration?: string;
}) {
  const { siteName, baseUrl } = SEO_CONFIG;
  const cityPart = pkg.city ? ` | ${pkg.city}` : '';
  
  return {
    title: `${pkg.name}${cityPart} | ${siteName}`,
    description: pkg.description 
      ? `Book ${pkg.name} for your event. ${pkg.duration ? `${pkg.duration} • ` : ''}${pkg.price ? `from $${pkg.price}` : 'Request quote'}. Available by date/time. Travel rules included.`.slice(0, 160)
      : `Book ${pkg.name} for your event. Check availability, pricing, and travel rules. Book online or pay in cash.`,
    image: pkg.image || SEO_CONFIG.defaultImage,
    type: 'product' as const,
  };
}

/**
 * Generate dynamic SEO for pro profile pages
 */
export function generateProSEO(pro: {
  displayName?: string;
  businessName?: string;
  city?: string;
  bio?: string;
  image?: string;
}) {
  const { siteName } = SEO_CONFIG;
  const name = pro.displayName || pro.businessName || 'Event Pro';
  const cityPart = pro.city ? ` in ${pro.city}` : '';
  
  return {
    title: `${name} | Event Pro${cityPart} | ${siteName}`,
    description: pro.bio?.slice(0, 160) || `View packages from ${name}. Check availability, travel range, and book services for your date and time.`,
    image: pro.image || SEO_CONFIG.defaultImage,
    type: 'profile' as const,
  };
}

/**
 * Categories for sitemap and internal linking
 */
export const SERVICE_CATEGORIES = [
  { slug: 'photography', name: 'Photography' },
  { slug: 'dj', name: 'DJs' },
  { slug: 'catering', name: 'Catering' },
  { slug: 'food-trucks', name: 'Food Trucks' },
  { slug: 'bartending', name: 'Bartending' },
  { slug: 'decorations', name: 'Decorations' },
  { slug: 'entertainment', name: 'Entertainment' },
  { slug: 'rentals', name: 'Rentals' },
  { slug: 'videography', name: 'Videography' },
  { slug: 'florist', name: 'Florist' },
];

/**
 * Check if a route should be noIndex
 */
export function shouldNoIndex(pathname: string): boolean {
  const noIndexPatterns = [
    '/auth',
    '/dashboard',
    '/vendor-dashboard',
    '/vendor-onboarding',
    '/eventpro-onboarding',
    '/marketspace-onboarding',
    '/marketspace-dashboard',
    '/post-auth',
    '/booking-success',
    '/checkout',
    '/onboarding',
  ];
  
  return noIndexPatterns.some(pattern => pathname.startsWith(pattern));
}
