/**
 * Admin Support Console
 * View Event Pro Assistant conversations and reply directly to customers.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { Send, MessageCircle, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  user_id: string;
  title: string;
  last_message_at: string;
  escalated_at: string | null;
  created_at: string;
  user_email?: string | null;
  user_name?: string | null;
  last_role?: string | null;
  last_preview?: string | null;
}

interface SupportMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  escalated: boolean;
  created_at: string;
}

export default function AdminSupport() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Admin gate
  useEffect(() => {
    (async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }
      const { data } = await supabase.rpc('get_my_roles');
      setIsAdmin(!!data?.includes('admin'));
      setCheckingRole(false);
    })();
  }, [user]);

  // Load all conversations
  const loadConversations = async () => {
    setLoadingList(true);
    const { data: convos, error } = await supabase
      .from('support_conversations')
      .select('id, user_id, title, last_message_at, escalated_at, created_at')
      .order('last_message_at', { ascending: false })
      .limit(200);

    if (error) {
      toast({ title: 'Failed to load conversations', description: error.message, variant: 'destructive' });
      setLoadingList(false);
      return;
    }

    const enriched: Conversation[] = await Promise.all(
      (convos ?? []).map(async (c) => {
        const [{ data: profile }, { data: lastMsg }] = await Promise.all([
          supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', c.user_id)
            .maybeSingle(),
          supabase
            .from('support_messages')
            .select('role, content')
            .eq('conversation_id', c.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);
        return {
          ...c,
          user_email: (profile as any)?.email ?? null,
          user_name: (profile as any)?.full_name ?? null,
          last_role: lastMsg?.role ?? null,
          last_preview: lastMsg?.content?.slice(0, 120) ?? null,
        };
      })
    );

    setConversations(enriched);
    setLoadingList(false);
  };

  useEffect(() => {
    if (isAdmin) loadConversations();
  }, [isAdmin]);

  // Load messages for active conversation + realtime
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoadingMessages(true);
    (async () => {
      const { data } = await supabase
        .from('support_messages')
        .select('id, role, content, escalated, created_at')
        .eq('conversation_id', activeId)
        .order('created_at', { ascending: true });
      if (!cancelled) {
        setMessages((data ?? []) as SupportMessage[]);
        setLoadingMessages(false);
      }
    })();

    const channel = supabase
      .channel(`admin-support-${activeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `conversation_id=eq.${activeId}` },
        (payload) => {
          const m = payload.new as SupportMessage;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [activeId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendReply = async () => {
    const text = reply.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    const { error } = await supabase
      .from('support_messages')
      .insert({ conversation_id: activeId, role: 'assistant', content: text, escalated: true });

    if (error) {
      toast({ title: 'Reply failed', description: error.message, variant: 'destructive' });
      setSending(false);
      return;
    }

    // Bump conversation timestamp so it sorts to the top
    await supabase
      .from('support_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', activeId);

    setReply('');
    setSending(false);
    // Refresh list previews in background
    loadConversations();
  };

  const filtered = useMemo(() => {
    if (!filter.trim()) return conversations;
    const q = filter.toLowerCase();
    return conversations.filter(
      (c) =>
        c.user_email?.toLowerCase().includes(q) ||
        c.user_name?.toLowerCase().includes(q) ||
        c.last_preview?.toLowerCase().includes(q)
    );
  }, [conversations, filter]);

  const activeConvo = conversations.find((c) => c.id === activeId);

  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> Home</Link>
            </Button>
            <h1 className="font-semibold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Customer Support Console
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={loadConversations}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4 h-[calc(100vh-3.5rem-3rem)]">
        {/* Conversation list */}
        <Card className="flex flex-col overflow-hidden">
          <div className="p-3 border-b">
            <Input
              placeholder="Search by email, name, message…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <ScrollArea className="flex-1">
            {loadingList ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No conversations yet.
              </div>
            ) : (
              <ul>
                {filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setActiveId(c.id)}
                      className={cn(
                        'w-full text-left px-3 py-3 border-b hover:bg-muted/50 transition-colors',
                        activeId === c.id && 'bg-muted'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {c.user_name || c.user_email || c.user_id.slice(0, 8)}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true })}
                        </span>
                      </div>
                      {c.user_email && c.user_name && (
                        <div className="text-[11px] text-muted-foreground truncate">{c.user_email}</div>
                      )}
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {c.last_role === 'user' ? '👤 ' : '🤖 '}
                        {c.last_preview || '—'}
                      </div>
                      {c.escalated_at && (
                        <Badge variant="destructive" className="mt-1.5 text-[10px] h-4 px-1.5">
                          <AlertCircle className="w-2.5 h-2.5 mr-1" /> Escalated
                        </Badge>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </Card>

        {/* Conversation view */}
        <Card className="flex flex-col overflow-hidden">
          {!activeConvo ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Select a conversation to view & reply.
            </div>
          ) : (
            <>
              <div className="p-3 border-b">
                <div className="font-semibold text-sm">
                  {activeConvo.user_name || activeConvo.user_email || 'Customer'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {activeConvo.user_email} · Started {format(new Date(activeConvo.created_at), 'PPp')}
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/20">
                {loadingMessages ? (
                  <Skeleton className="h-20 w-3/4" />
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        'flex',
                        m.role === 'user' ? 'justify-start' : 'justify-end'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2.5 max-w-[80%] text-sm',
                          m.role === 'user'
                            ? 'bg-background border'
                            : m.escalated
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground'
                        )}
                      >
                        <div className="text-[10px] opacity-70 mb-1 flex items-center gap-1.5">
                          {m.role === 'user'
                            ? 'Customer'
                            : m.escalated
                            ? 'You (Admin)'
                            : 'AI Assistant'}
                          <span>· {format(new Date(m.created_at), 'p')}</span>
                        </div>
                        {m.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); sendReply(); }}
                className="border-t p-3 flex gap-2"
              >
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Reply as Event Pro Support…"
                  rows={2}
                  className="resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                />
                <Button type="submit" disabled={sending || !reply.trim()}>
                  <Send className="w-4 h-4 mr-2" /> Send
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
