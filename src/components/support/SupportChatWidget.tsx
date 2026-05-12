import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles, UserRound } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  escalated?: boolean;
  streaming?: boolean;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export function SupportChatWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // External trigger (e.g. Support page "Chat now" button)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-support-chat', handler);
    return () => window.removeEventListener('open-support-chat', handler);
  }, []);

  // Load history when opening for logged-in users
  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    setLoadingHistory(true);
    (async () => {
      const { data: convo } = await supabase
        .from('support_conversations')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!convo) {
        if (!cancelled) {
          setMessages([]);
          setLoadingHistory(false);
        }
        return;
      }
      const { data } = await supabase
        .from('support_messages')
        .select('id, role, content, escalated')
        .eq('conversation_id', convo.id)
        .order('created_at', { ascending: true });
      if (!cancelled) {
        setMessages(
          (data ?? [])
            .filter((m) => m.role !== 'system')
            .map((m) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              escalated: m.escalated,
            }))
        );
        setLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  useEffect(() => {
    if (open && !sending) textareaRef.current?.focus();
  }, [open, sending, messages.length]);

  const send = async (text: string, opts?: { escalate?: boolean }) => {
    if (!user) {
      toast({
        title: 'Sign in to chat with support',
        description: 'So we can save your conversation and follow up by email.',
      });
      return;
    }
    const content = text.trim();
    if (!content || sending) return;

    const userMsg: ChatMessage = {
      id: `tmp-${Date.now()}`,
      role: 'user',
      content,
    };
    const assistantId = `a-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      streaming: true,
    };
    setMessages((m) => [...m, userMsg, assistantMsg]);
    setInput('');
    setSending(true);

    const updateAssistant = (patch: Partial<ChatMessage>) => {
      setMessages((m) =>
        m.map((msg) => (msg.id === assistantId ? { ...msg, ...patch } : msg)),
      );
    };
    const appendToken = (token: string) => {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId ? { ...msg, content: msg.content + token } : msg,
        ),
      );
    };

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${SUPABASE_URL}/functions/v1/support-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_ANON,
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          message: opts?.escalate
            ? `${content}\n\n[User clicked "Talk to a human" — please escalate.]`
            : content,
          stream: true,
        }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || `Chat request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let escalated = false;
      let streamError: string | null = null;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload) continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === 'token' && typeof evt.content === 'string') {
              appendToken(evt.content);
            } else if (evt.type === 'done') {
              escalated = Boolean(evt.escalated);
            } else if (evt.type === 'error') {
              streamError = String(evt.message ?? 'Stream error');
            }
          } catch {
            // ignore malformed event
          }
        }
      }

      if (streamError) throw new Error(streamError);

      updateAssistant({ streaming: false, escalated });
      if (escalated) {
        toast({
          title: 'Forwarded to Event Pro Support',
          description: 'A specialist will follow up with you shortly.',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Chat error',
        description: err?.message ?? 'Please try again.',
        variant: 'destructive',
      });
      updateAssistant({
        streaming: false,
        content:
          "Sorry, I couldn't reach our servers right now. Please try again in a moment, or use the **Talk to Event Pro Support** option below to forward your question.",
      });
    } finally {
      setSending(false);
    }
  };

  const handleEscalate = () => {
    send('Please forward my question to Event Pro Support.', { escalate: true });
  };

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
        aria-label={open ? 'Close support chat' : 'Open support chat'}
        whileTap={{ scale: 0.92 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-3 left-3 sm:left-auto sm:right-5 sm:w-[380px] z-50 max-h-[78vh] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 via-background to-background flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Vendibook Assistant
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20"
                      title={sending ? 'AI is responding…' : 'AI assistant is online'}
                      aria-live="polite"
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      {sending ? 'AI responding' : 'AI live'}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">AI assistant · backed by Event Pro Support</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-muted/20">
              {!user ? (
                <div className="text-sm text-center py-8 px-4 text-muted-foreground space-y-3">
                  <p>Sign in to chat with our support assistant.</p>
                  <Link to="/auth">
                    <Button size="sm">Sign in</Button>
                  </Link>
                </div>
              ) : loadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-sm text-muted-foreground py-6 px-2 space-y-3">
                  <p className="font-medium text-foreground">Hey 👋 — how can I help?</p>
                  <p>Ask about bookings, cancellations, payouts, refunds, or your account. If I can't resolve it, I'll forward your question to Event Pro Support.</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      'How do refunds work?',
                      'When do Event Pros get paid?',
                      'How do I cancel my booking?',
                    ].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => send(q)}
                        className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:border-primary hover:text-primary transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    {m.role === 'assistant' && (
                      <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] text-sm leading-relaxed',
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground px-3 py-2 rounded-2xl rounded-br-sm'
                          : 'text-foreground'
                      )}
                    >
                      {m.role === 'assistant' ? (
                        m.streaming && !m.content ? (
                          <div className="flex items-center gap-1.5 py-1" aria-label="AI is typing">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce" />
                          </div>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-a:text-primary">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                            {m.streaming && (
                              <span
                                aria-hidden="true"
                                className="ml-0.5 inline-block h-3.5 w-[2px] -mb-0.5 bg-primary animate-pulse align-middle"
                              />
                            )}
                          </div>
                        )
                      ) : (
                        <span className="whitespace-pre-wrap">{m.content}</span>
                      )}
                      {m.escalated && (
                        <div className="mt-1 text-[11px] font-medium text-primary">
                          ✓ Forwarded to Event Pro Support
                        </div>
                      )}
                    </div>
                    {m.role === 'user' && (
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {user && (
              <div className="border-t border-border bg-background p-3 space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                  className="flex items-end gap-2"
                >
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                      }
                    }}
                    placeholder="Ask anything…"
                    rows={1}
                    disabled={sending}
                    className="min-h-[40px] max-h-32 resize-none text-sm"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={sending || !input.trim()}
                    className="shrink-0 h-10 w-10"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
                <button
                  type="button"
                  onClick={handleEscalate}
                  disabled={sending}
                  className="w-full text-[11px] text-muted-foreground hover:text-primary transition text-center disabled:opacity-50"
                >
                  Talk to Event Pro Support →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
