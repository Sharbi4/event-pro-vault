import { useEffect } from 'react';
import { generateJsonLd } from '@/hooks/useSEO';

interface JsonLdProps {
  type: string;
  data: Record<string, unknown>;
}

/**
 * Component to inject JSON-LD structured data into the page head
 * Used for rich snippets in Google search results
 */
export function JsonLd({ type, data }: JsonLdProps) {
  useEffect(() => {
    const scriptId = `json-ld-${type.toLowerCase()}-${Date.now()}`;
    
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

  return null;
}

/**
 * Website schema for homepage
 */
export function WebsiteJsonLd() {
  return (
    <JsonLd
      type="WebSite"
      data={{
        name: 'EventPro by Vendibook',
        description: 'Book premium event Vendors in minutes',
      }}
    />
  );
}

/**
 * Organization schema for business identity
 */
export function OrganizationJsonLd() {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'EventPro by Vendibook',
      url: 'https://event-pro-vault.lovable.app',
      logo: 'https://event-pro-vault.lovable.app/favicon.png',
      description: 'Premium event Vendor marketplace. Book photographers, DJs, caterers, food trucks and more.',
      foundingDate: '2024',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@vendibook.com',
        availableLanguage: 'English',
      },
      sameAs: [
        'https://twitter.com/eventpro',
        'https://facebook.com/eventpro',
        'https://instagram.com/eventpro',
        'https://linkedin.com/company/eventpro',
      ],
    };

    const script = document.createElement('script');
    script.id = 'json-ld-organization';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('json-ld-organization');
      if (el) el.remove();
    };
  }, []);

  return null;
}

/**
 * Breadcrumb schema for navigation
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      type="BreadcrumbList"
      data={{ items }}
    />
  );
}

/**
 * FAQ schema for FAQ pages
 */
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ faqs }: { faqs: FAQItem[] }) {
  return (
    <JsonLd
      type="FAQPage"
      data={{ faqs }}
    />
  );
}

/**
 * Product schema for packages
 */
interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  vendorName: string;
  rating?: number;
  reviewCount?: number;
}

export function ProductJsonLd({ data }: { data: ProductData }) {
  return (
    <JsonLd
      type="Product"
      data={data as unknown as Record<string, unknown>}
    />
  );
}

/**
 * LocalBusiness schema for Vendor profiles
 */
interface LocalBusinessData {
  id: string;
  name: string;
  description: string;
  image?: string;
  city?: string;
  state?: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
}

export function LocalBusinessJsonLd({ data }: { data: LocalBusinessData }) {
  return (
    <JsonLd
      type="LocalBusiness"
      data={data as unknown as Record<string, unknown>}
    />
  );
}

/**
 * Article schema for blog posts
 */
interface ArticleData {
  title: string;
  excerpt: string;
  slug: string;
  image?: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName: string;
  authorAvatar?: string;
}

export function ArticleJsonLd({ data }: { data: ArticleData }) {
  return (
    <JsonLd
      type="Article"
      data={data as unknown as Record<string, unknown>}
    />
  );
}
