import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useEffect } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const BASE_URL = 'https://event-pro-vault.lovable.app';

/**
 * Visual breadcrumb navigation with JSON-LD schema
 */
export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Inject JSON-LD for breadcrumbs
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: BASE_URL,
        },
        ...items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 2,
          name: item.label,
          item: item.href ? `${BASE_URL}${item.href}` : undefined,
        })),
      ],
    };

    const script = document.createElement('script');
    script.id = 'json-ld-breadcrumbs';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    
    // Remove existing breadcrumb schema
    const existing = document.getElementById('json-ld-breadcrumbs');
    if (existing) existing.remove();
    
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('json-ld-breadcrumbs');
      if (el) el.remove();
    };
  }, [items]);

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center gap-1 text-sm text-muted-foreground ${className}`}
    >
      <Link 
        to="/" 
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4" />
          {item.href && index < items.length - 1 ? (
            <Link 
              to={item.href} 
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
