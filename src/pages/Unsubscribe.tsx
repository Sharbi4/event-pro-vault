import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type State =
  | { kind: 'validating' }
  | { kind: 'ready' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'already' }
  | { kind: 'error'; message: string };

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState<State>({ kind: 'validating' });

  useEffect(() => {
    if (!token) {
      setState({ kind: 'error', message: 'Missing unsubscribe token.' });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } }
        );
        const data = await res.json();
        if (!res.ok) {
          setState({ kind: 'error', message: data.error ?? 'Invalid link.' });
          return;
        }
        if (data.valid === false && data.reason === 'already_unsubscribed') {
          setState({ kind: 'already' });
          return;
        }
        setState({ kind: 'ready' });
      } catch {
        setState({ kind: 'error', message: 'Could not validate the link.' });
      }
    })();
  }, [token]);

  const handleConfirm = async () => {
    if (!token) return;
    setState({ kind: 'submitting' });
    const { data, error } = await supabase.functions.invoke(
      'handle-email-unsubscribe',
      { body: { token } }
    );
    if (error) {
      setState({ kind: 'error', message: 'Could not unsubscribe. Try again.' });
      return;
    }
    if (data?.success) setState({ kind: 'success' });
    else if (data?.reason === 'already_unsubscribed') setState({ kind: 'already' });
    else setState({ kind: 'error', message: 'Unexpected response.' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md p-8 text-center space-y-5">
        <h1 className="text-2xl font-semibold">Unsubscribe from EventPros</h1>

        {state.kind === 'validating' && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Checking your link…</p>
          </div>
        )}

        {state.kind === 'ready' && (
          <>
            <p className="text-muted-foreground">
              You'll stop receiving non-essential emails from EventPros.
              Booking-related notifications you've signed up for may still be sent.
            </p>
            <Button onClick={handleConfirm} className="w-full" size="lg">
              Confirm unsubscribe
            </Button>
          </>
        )}

        {state.kind === 'submitting' && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Processing…</p>
          </div>
        )}

        {state.kind === 'success' && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <p className="text-muted-foreground">
              You've been unsubscribed. Sorry to see you go.
            </p>
          </div>
        )}

        {state.kind === 'already' && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <p className="text-muted-foreground">
              This email is already unsubscribed.
            </p>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-muted-foreground">{state.message}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
