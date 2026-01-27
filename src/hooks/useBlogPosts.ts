import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type BlogCategory = 'event-planning' | 'vendor-tips' | 'industry-news' | 'featured-vendors';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: BlogCategory;
  tags: string[] | null;
  author_id: string | null;
  author_name: string;
  author_avatar: string | null;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  read_time_minutes: number;
  created_at: string;
  updated_at: string;
}

interface UseBlogPostsOptions {
  category?: BlogCategory;
  search?: string;
  limit?: number;
  featured?: boolean;
}

export function useBlogPosts(options: UseBlogPostsOptions = {}) {
  const { category, search, limit = 50, featured } = options;

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts', category, search, limit, featured],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
      }

      if (featured !== undefined) {
        query = query.eq('is_featured', featured);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching blog posts:', error);
        return [];
      }

      return data as BlogPost[];
    },
  });

  const { data: featuredPosts = [] } = useQuery({
    queryKey: ['blog-posts-featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching featured posts:', error);
        return [];
      }

      return data as BlogPost[];
    },
  });

  return {
    posts,
    featuredPosts,
    isLoading,
  };
}

export function useBlogPost(slug: string) {
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as BlogPost;
    },
    enabled: !!slug,
  });

  return {
    post,
    isLoading,
    error,
  };
}
