import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, Clock, Calendar, ArrowRight, 
  Sparkles, Users, TrendingUp, BookOpen
} from 'lucide-react';
import { useBlogPosts, BlogCategory } from '@/hooks/useBlogPosts';
import { format } from 'date-fns';
import { useSEO } from '@/hooks/useSEO';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const categories: { id: BlogCategory | 'all'; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Posts', icon: BookOpen },
  { id: 'event-planning', label: 'Event Planning', icon: Calendar },
  { id: 'vendor-tips', label: 'Vendor Success', icon: TrendingUp },
  { id: 'industry-news', label: 'Industry News', icon: Sparkles },
  { id: 'featured-vendors', label: 'Featured Vendors', icon: Users },
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { posts, featuredPosts, isLoading } = useBlogPosts({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchQuery,
  });

  // SEO for Blog index
  useSEO({
    title: 'Event Pro Blog - Tips for Hosts & Vendors',
    description: 'Expert tips for event planning, vendor success strategies, and industry insights. Learn how to create unforgettable events.',
    canonical: 'https://event-pro-vault.lovable.app/blog',
    type: 'website',
    keywords: [
      'event planning tips',
      'vendor success',
      'event industry news',
      'catering tips',
      'wedding planning',
      'party planning guide',
    ],
  });

  return (
    <Layout>
      {/* Breadcrumb Schema */}
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://event-pro-vault.lovable.app/' },
        { name: 'Blog', url: 'https://event-pro-vault.lovable.app/blog' },
      ]} />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                Event Pro Blog
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold font-display mb-4">
                Insights for Event Success
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Expert tips for hosts planning unforgettable events and vendors growing their business.
              </p>
              
              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="border-b border-border sticky top-16 lg:top-20 bg-background/95 backdrop-blur-sm z-10">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-full whitespace-nowrap gap-2"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {/* Featured Posts */}
          {selectedCategory === 'all' && !searchQuery && featuredPosts.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Featured Articles
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {isLoading ? (
                  <>
                    <Skeleton className="h-80 rounded-xl" />
                    <Skeleton className="h-80 rounded-xl" />
                  </>
                ) : (
                  featuredPosts.slice(0, 2).map((post) => (
                    <Link key={post.id} to={`/blog/${post.slug}`}>
                      <Card className="overflow-hidden h-full group hover:shadow-lg transition-all">
                        <div className="relative h-48">
                          <img
                            src={post.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <Badge className="absolute top-4 left-4">
                            {post.category.replace('-', ' ')}
                          </Badge>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {post.published_at && format(new Date(post.published_at), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {post.read_time_minutes} min read
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </section>
          )}

          {/* All Posts Grid */}
          <section>
            <h2 className="text-2xl font-bold mb-6">
              {selectedCategory === 'all' ? 'Latest Articles' : categories.find(c => c.id === selectedCategory)?.label}
            </h2>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-72 rounded-xl" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No articles found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : 'Check back soon for new content'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <Card className="overflow-hidden h-full group hover:shadow-lg transition-all">
                      <div className="relative h-40">
                        <img
                          src={post.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-5">
                        <Badge variant="secondary" className="mb-3 text-xs">
                          {post.category.replace('-', ' ')}
                        </Badge>
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{post.author_name}</span>
                          <span>{post.read_time_minutes} min read</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* CTA Section */}
          <section className="mt-16 text-center">
            <Card className="p-8 bg-gradient-to-r from-primary/5 to-primary/10">
              <h3 className="text-2xl font-bold mb-3">Want to be featured?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Event Pros with exceptional service and reviews may be featured in our blog.
              </p>
              <Button asChild>
                <Link to="/become-a-pro">
                  Become an Event Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </Card>
          </section>
        </div>
      </div>
    </Layout>
  );
}
