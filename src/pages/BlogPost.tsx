import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, Clock, Calendar, Share2, 
  Facebook, Twitter, Linkedin, Copy, Check,
  ArrowRight
} from 'lucide-react';
import { useBlogPost, useBlogPosts } from '@/hooks/useBlogPosts';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSEO } from '@/hooks/useSEO';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import DOMPurify from 'dompurify';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { post, isLoading } = useBlogPost(slug || '');
  const { posts: relatedPosts } = useBlogPosts({ 
    category: post?.category,
    limit: 3 
  });
  const [copied, setCopied] = useState(false);

  // Dynamic SEO for blog post
  useSEO({
    title: post?.title || 'Blog - EventPro',
    description: post?.excerpt || 'Read the latest articles about event planning, Event Pro tips, and industry insights.',
    canonical: post ? `https://event-pro-vault.lovable.app/blog/${post.slug}` : undefined,
    type: 'article',
    image: post?.cover_image_url || undefined,
    author: post?.author_name,
    publishedTime: post?.published_at || undefined,
    keywords: post?.tags || ['event planning', 'Event Pro tips', 'industry news'],
  });

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post?.title || '');
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-80 w-full rounded-xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <p className="text-muted-foreground mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </Layout>
    );
  }

  const filteredRelated = relatedPosts.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <Layout>
      {/* Article Structured Data */}
      {post && (
        <>
          <ArticleJsonLd
            data={{
              title: post.title,
              excerpt: post.excerpt || '',
              slug: post.slug,
              image: post.cover_image_url || undefined,
              publishedAt: post.published_at || '',
              modifiedAt: post.updated_at,
              authorName: post.author_name,
              authorAvatar: post.author_avatar || undefined,
            }}
          />
          <BreadcrumbJsonLd
            items={[
              { name: 'Home', url: 'https://event-pro-vault.lovable.app/' },
              { name: 'Blog', url: 'https://event-pro-vault.lovable.app/blog' },
              { name: post.title, url: `https://event-pro-vault.lovable.app/blog/${post.slug}` },
            ]}
          />
        </>
      )}
      
      <article className="min-h-screen bg-background">
        {/* Header */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>

          {/* Category Badge */}
          <Badge variant="secondary" className="mb-4">
            {post.category.replace('-', ' ')}
          </Badge>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold font-display mb-4">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={post.author_avatar || undefined} />
                <AvatarFallback>{post.author_name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{post.author_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {post.published_at && format(new Date(post.published_at), 'MMMM d, yyyy')}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.read_time_minutes} min read
            </div>
          </div>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="relative rounded-xl overflow-hidden mb-8">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-64 lg:h-96 object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content, {
                FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
                FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus'],
              }),
            }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Share */}
          <Card className="mb-12">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Share this article</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('facebook')}
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('twitter')}
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('linkedin')}
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="w-4 h-4 text-trust" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          {filteredRelated.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {filteredRelated.map((relatedPost) => (
                  <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                    <Card className="overflow-hidden h-full group hover:shadow-lg transition-all">
                      <div className="relative h-32">
                        <img
                          src={relatedPost.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          {relatedPost.read_time_minutes} min read
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="mt-12 text-center">
            <Card className="p-8 bg-gradient-to-r from-primary/5 to-primary/10">
              <h3 className="text-xl font-bold mb-3">Ready to book your next event?</h3>
              <p className="text-muted-foreground mb-6">
                Find the perfect Event Pro for your upcoming celebration.
              </p>
              <Button asChild>
                <Link to="/discover">
                  Discover Event Pros
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </Card>
          </section>
        </div>
      </article>
    </Layout>
  );
}
