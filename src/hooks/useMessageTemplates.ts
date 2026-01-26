import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MessageTemplate {
  id: string;
  user_id: string;
  name: string;
  content: string;
  category: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const DEFAULT_TEMPLATES = [
  {
    name: 'Booking Confirmation',
    content: "Thank you for your booking! I'm excited to be part of your event on [DATE]. I'll reach out again 48 hours before to confirm all the details. Feel free to message me if you have any questions!",
    category: 'booking',
    sort_order: 0,
  },
  {
    name: '48-Hour Reminder',
    content: "Hi! Just a friendly reminder that your event is coming up in 48 hours. Please confirm the venue address and any last-minute details. Looking forward to seeing you!",
    category: 'reminder',
    sort_order: 1,
  },
  {
    name: 'Thank You Follow-up',
    content: "Thank you so much for having me at your event! I hope everything exceeded your expectations. If you have a moment, I'd really appreciate a review. It helps me grow my business!",
    category: 'followup',
    sort_order: 2,
  },
  {
    name: 'Quote Response',
    content: "Thanks for reaching out! Based on your event details, here's what I can offer: [DETAILS]. Let me know if you have any questions or would like to proceed with booking.",
    category: 'inquiry',
    sort_order: 3,
  },
  {
    name: 'Availability Check',
    content: "Thanks for your interest! I'm checking my calendar for [DATE]. I'll get back to you within 24 hours to confirm availability and provide pricing details.",
    category: 'inquiry',
    sort_order: 4,
  },
];

export function useMessageTemplates() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading, refetch } = useQuery({
    queryKey: ['message-templates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as MessageTemplate[];
    },
    enabled: !!user?.id,
  });

  const seedDefaultTemplates = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      const templatesWithUserId = DEFAULT_TEMPLATES.map((t) => ({
        ...t,
        user_id: user.id,
      }));

      const { error } = await supabase
        .from('message_templates')
        .insert(templatesWithUserId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Default templates added');
    },
    onError: (error) => {
      toast.error('Failed to add default templates');
      console.error(error);
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (data: { name: string; content: string; category?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('message_templates')
        .insert({
          user_id: user.id,
          name: data.name,
          content: data.content,
          category: data.category || null,
          sort_order: templates.length,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Template created');
    },
    onError: (error) => {
      toast.error('Failed to create template');
      console.error(error);
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async (data: { id: string; name?: string; content?: string; category?: string }) => {
      const { id, ...updates } = data;
      const { error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Template updated');
    },
    onError: (error) => {
      toast.error('Failed to update template');
      console.error(error);
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Template deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete template');
      console.error(error);
    },
  });

  return {
    templates,
    isLoading,
    refetch,
    seedDefaultTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
