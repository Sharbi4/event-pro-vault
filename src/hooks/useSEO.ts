import { useEffect } from 'react';
import { SEO_CONFIG, shouldNoIndex } from '@/lib/seoConfig';

export interface SEOData {
  title: string;
  description: string;
  canonical?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  image?: string;
  imageAlt?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

const { baseUrl: BASE_URL, defaultImage: DEFAULT_IMAGE, siteName: SITE_NAME } = SEO_CONFIG;

/**
 * Dynamic SEO hook for setting page-specific meta tags
 * Updates document head on mount and cleans up on unmount
 */
export function useSEO(data: SEOData) {
  useEffect(() => {
    const {
      title,
      description,
      canonical,
      type = 'website',
      image = DEFAULT_IMAGE,
      imageAlt = title,
      keywords = [],
      author,
      publishedTime,
      modifiedTime,
      noIndex = false,
    } = data;

    // Check if route should be noIndex based on pathname
    const pathNoIndex = shouldNoIndex(window.location.pathname);
    const finalNoIndex = noIndex || pathNoIndex;

    // Format title - don't double-add site name
    const fullTitle = title.includes(SITE_NAME) || title.includes('EventPro') 
      ? title 
      : `${title} | ${SITE_NAME}`;
    
    // Truncate description for SEO (max 160 chars, min 140 chars ideal)
    const truncatedDesc = description.length > 160 
      ? description.substring(0, 157) + '...' 
      : description;

    // Update document title
    document.title = fullTitle;

    // Helper to set/update meta tags
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    setMeta('description', truncatedDesc);
    setMeta('author', author || SITE_NAME);
    
    // Merge default keywords with page-specific
    const allKeywords = [...new Set([...SEO_CONFIG.keywords, ...keywords])];
    if (allKeywords.length > 0) {
      setMeta('keywords', allKeywords.slice(0, 10).join(', '));
    }

    // Robots - respect noIndex setting
    setMeta('robots', finalNoIndex 
      ? 'noindex, nofollow' 
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    // Open Graph
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', truncatedDesc, true);
    setMeta('og:type', type === 'product' ? 'product' : (type === 'profile' ? 'profile' : 'website'), true);
    setMeta('og:url', canonical || window.location.href.split('?')[0], true);
    setMeta('og:image', image.startsWith('http') ? image : `${BASE_URL}${image}`, true);
    setMeta('og:image:alt', imageAlt, true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:locale', 'en_US', true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:site', SEO_CONFIG.twitterHandle);
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', truncatedDesc);
    setMeta('twitter:image', image.startsWith('http') ? image : `${BASE_URL}${image}`);
    setMeta('twitter:image:alt', imageAlt);

    // Article-specific meta
    if (type === 'article') {
      if (publishedTime) {
        setMeta('article:published_time', publishedTime, true);
      }
      if (modifiedTime) {
        setMeta('article:modified_time', modifiedTime, true);
      }
      if (author) {
        setMeta('article:author', author, true);
      }
    }

    // Product-specific meta
    if (type === 'product') {
      setMeta('product:availability', 'in stock', true);
      setMeta('product:condition', 'new', true);
    }

    // Canonical URL - always strip query params for clean URLs
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.rel = 'canonical';
      document.head.appendChild(canonicalEl);
    }
    // Use provided canonical or current URL without query params
    canonicalEl.href = canonical || window.location.href.split('?')[0];

    // Cleanup function - restore defaults on unmount
    return () => {
      document.title = SITE_NAME;
    };
  }, [data]);
}

/**
 * Generate JSON-LD structured data for different page types
 */
export function generateJsonLd(type: string, data: Record<string, unknown>): string {
  const baseOrg = {
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.png`,
    sameAs: [
      'https://twitter.com/eventpro',
      'https://facebook.com/eventpro',
      'https://instagram.com/eventpro',
    ],
  };

  let schema: Record<string, unknown>;

  switch (type) {
    case 'WebSite':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: BASE_URL,
        description: 'Book premium event Event Pros in minutes. Find photographers, DJs, caterers, food trucks and more.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/browse?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        publisher: baseOrg,
      };
      break;

    case 'LocalBusiness':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${BASE_URL}/pro/${data.id}`,
        name: data.name,
        description: data.description,
        image: data.image,
        url: `${BASE_URL}/pro/${data.id}`,
        address: data.address ? {
          '@type': 'PostalAddress',
          addressLocality: data.city,
          addressRegion: data.state,
        } : undefined,
        aggregateRating: data.rating ? {
          '@type': 'AggregateRating',
          ratingValue: data.rating,
          reviewCount: data.reviewCount,
          bestRating: 5,
          worstRating: 1,
        } : undefined,
        priceRange: data.priceRange || '$$',
      };
      break;

    case 'Product':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${BASE_URL}/package/${data.id}`,
        name: data.name,
        description: data.description,
        image: data.image,
        brand: {
          '@type': 'Brand',
          name: data.vendorName,
        },
        offers: {
          '@type': 'Offer',
          url: `${BASE_URL}/package/${data.id}`,
          priceCurrency: 'USD',
          price: data.price,
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: data.vendorName,
          },
        },
        aggregateRating: data.rating ? {
          '@type': 'AggregateRating',
          ratingValue: data.rating,
          reviewCount: data.reviewCount,
          bestRating: 5,
          worstRating: 1,
        } : undefined,
      };
      break;

    case 'Article':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        description: data.excerpt,
        image: data.image,
        datePublished: data.publishedAt,
        dateModified: data.modifiedAt || data.publishedAt,
        author: {
          '@type': 'Person',
          name: data.authorName,
          image: data.authorAvatar,
        },
        publisher: baseOrg,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${BASE_URL}/blog/${data.slug}`,
        },
      };
      break;

    case 'FAQPage':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: (data.faqs as Array<{ question: string; answer: string }>)?.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      };
      break;

    case 'BreadcrumbList':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: (data.items as Array<{ name: string; url: string }>)?.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };
      break;

    default:
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: data.title,
        description: data.description,
        url: data.url || window.location.href,
      };
  }

  return JSON.stringify(schema);
}

/**
 * Component to inject JSON-LD into head
 */
export function useJsonLd(type: string, data: Record<string, unknown>) {
  useEffect(() => {
    const scriptId = `json-ld-${type.toLowerCase()}`;
    
    // Remove existing script if any
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    // Create new script element
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = generateJsonLd(type, data);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [type, JSON.stringify(data)]);
}
