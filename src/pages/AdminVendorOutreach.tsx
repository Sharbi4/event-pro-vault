/**
 * Admin Vendor Outreach
 * Sends 1:1 personalized invite emails to a list of mobile food vendors.
 * Each send goes through send-transactional-email with a unique idempotency
 * key, so retries are safe and every send is logged in email_send_log.
 */

import { useEffect, useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Recipient = { business: string; area: string; email: string };
type SendResult = { recipient: Recipient; status: 'queued' | 'sent' | 'failed'; error?: string };

const DEFAULT_LIST = `Ralph's Snack Bar, Phoenix, rsb@RalphsSnackBar.com
Cheese Out Food Truck, Phoenix, Info@CheeseOutFoodTruck.com
RockStar Hot Dogs, Phoenix, Info@RockStarHotDogs.com
Modern Tortilla, Phoenix, viviannad@moderntortilla.com
Phoenix Food Truck Association, Phoenix, info@phxfta.org
Food Trucks PHX, Phoenix, info@foodtrucksphx.com
Phoenix Food Truck Rentals, Phoenix, FoodTruckBuildersOfPhoenix@gmail.com
Mannamobile Food Truck, Phoenix, mannamobilefoodtruck@gmail.com
Yellowman Fry Bread, Phoenix, yellowmanfrybread@gmail.com
Heat Coffee, Phoenix, hello@heatcoffeeaz.com
Two Cat Coffee, Phoenix, info@twocatcoffee.com
Taco'Queta, Tucson, ramonf2015.rf@gmail.com
The Blacktop Grill, Tucson, theblacktopgrill@outlook.com
Tucson Food Truck Roundup, Tucson, tucsonfoodtruckroundup@gmail.com
Tucson Chefs Catering, Tucson, TucsonChefs@gmail.com
Special Eats Tucson, Tucson, events@specialeats.org
Special Eats Tucson, Tucson, azspecialeats@gmail.com
Pin-Up Pastries / Fork U BBQ, Tucson, pinuppastries1@gmail.com
Burrotron LLC, Tucson, luismiguelpadres@gmail.com
Purple Tree Truck, Tucson, purpletreetruck@gmail.com
El Antojo Poblano, Tucson, elantojopoblano20@gmail.com
Phoenix Food Truck Catering, Phoenix, phoenixfoodtruckcatering@gmail.com
Re Di Roma Wood-Fired Pizza, Phoenix metro, info@ReDiRoma.com
Wok This Way, Phoenix metro, kris@wokthisway.today
Churro GoNUTZ, Phoenix metro, churrogonutz@gmail.com
Magic Kitchen Indonesian Cuisine, Phoenix metro, ordermagickitchen@gmail.com
Fluffy Vegans, Phoenix metro, fluffyvegans@gmail.com
Coney Shack & Grill, Phoenix metro / Goodyear, coneyshack20@gmail.com
K Star BBQ, Phoenix metro / Peoria, kathy@kstarbbq.com
Mickey's Bar-B-Que Food Truck, Phoenix metro / Litchfield Park, mickeysbarbq@cox.net
All Cooped Up In AZ, Phoenix metro / San Tan Valley, allcoopedupinaz@gmail.com
AZ Hawaiian Garlic Shrimp, Phoenix metro / San Tan Valley, jkhuihui@gmail.com
Cactus Dogs & Lemonade West, Phoenix metro / Surprise, cactusdogswest555@gmail.com
Mission Hot Dogs, Phoenix, info@missionhotdogs.com
The Mexican's Food Truck, Phoenix, themexicansfoodtruck@gmail.com
Pakka Local, Tucson, pakkalocalaz@gmail.com
Malta Joe, Tucson, info@maltajoe.com
Daniela's Cooking, Tucson, ranchopreciado@outlook.com
Solid Grindz Catering, Tucson, solidgrindzcatering@gmail.com
Licks Ice Cream, Tucson / Catalina, lickscatalina@gmail.com
Ceres / Noodies Tucson, Tucson, cerestucson@gmail.com
Noodies Tucson, Tucson, noodiestucson@gmail.com
Tucson Mobile Bartending, Tucson, TucsonMobileBartending@gmail.com`;

const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

function parseList(raw: string): Recipient[] {
  const lines = raw.split(/\\r?\\n/).map((l) => l.trim()).filter(Boolean);
  const out: Recipient[] = [];
  for (const line of lines) {
    // Skip header lines
    if (/^business[\\s,]/i.test(line)) continue;
    // Split on commas or tabs, take last segment as email
    const parts = line.split(/[\\t,]+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;
    const email = parts[parts.length - 1];
    if (!EMAIL_RE.test(email)) continue;
    const business = parts[0];
    const area = parts.length >= 3 ? parts.slice(1, -1).join(', ') : 'Arizona';
    out.push({ business, area, email });
  }
  // Dedupe by lowercase email, keeping first occurrence
  const seen = new Set<string>();
  return out.filter((r) => {
    const k = r.email.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);
}

export default function AdminVendorOutreach() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  const [raw, setRaw] = useState(DEFAULT_LIST);
  const [campaignTag, setCampaignTag] = useState(() => `az-launch-${new Date().toISOString().slice(0, 10)}`);
  const [delayMs, setDelayMs] = useState(750);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<SendResult[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setCheckingRole(false);
        return;
      }
      const { data } = await supabase.rpc('get_my_roles');
      setIsAdmin((data as string[] | null)?.includes('admin') || false);
      setCheckingRole(false);
    }
    checkAdmin();
  }, [user]);

  const recipients = useMemo(() => parseList(raw), [raw]);

  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const sentCount = results.filter((r) => r.status === 'sent' || r.status === 'queued').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;

  async function handleSend() {
    if (sending) return;
    if (recipients.length === 0) {
      toast.error('No valid recipients');
      return;
    }
    if (!confirm(`Send personalized invites to ${recipients.length} vendors?`)) return;

    setSending(true);
    setResults([]);
    setProgress({ done: 0, total: recipients.length });

    const tag = slugify(campaignTag) || 'outreach';
    const out: SendResult[] = [];

    for (let i = 0; i < recipients.length; i++) {
      const r = recipients[i];
      const idempotencyKey = `vendor-outreach-${tag}-${slugify(r.email)}`;
      try {
        const { error } = await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'vendor-outreach-invite',
            recipientEmail: r.email,
            idempotencyKey,
            templateData: { businessName: r.business, area: r.area },
          },
        });
        if (error) {
          out.push({ recipient: r, status: 'failed', error: error.message });
        } else {
          out.push({ recipient: r, status: 'queued' });
        }
      } catch (err: any) {
        out.push({ recipient: r, status: 'failed', error: err?.message ?? 'Unknown error' });
      }
      setResults([...out]);
      setProgress({ done: i + 1, total: recipients.length });
      // Small spacing so we don't burst the queue
      if (i < recipients.length - 1 && delayMs > 0) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }

    setSending(false);
    const ok = out.filter((x) => x.status !== 'failed').length;
    const bad = out.length - ok;
    toast.success(`Outreach complete: ${ok} queued, ${bad} failed`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Mail className="w-7 h-7" /> Vendor Outreach
          </h1>
          <p className="text-muted-foreground mt-2">
            Sends personalized 1:1 invite emails through EventPro's transactional pipeline.
            Each send is logged and rate-limited.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left: input */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recipient list</CardTitle>
                <CardDescription>
                  One vendor per line: <code className="text-xs">Business, Area, email</code>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  rows={16}
                  className="font-mono text-xs"
                  disabled={sending}
                />
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary">{recipients.length} valid recipients</Badge>
                </div>
              </CardContent>
            </Card>

            {results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Send log</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {sentCount} queued · {failedCount} failed
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[420px] overflow-y-auto">
                  <ul className="divide-y">
                    {results.map((r, i) => (
                      <li key={i} className="py-2 flex items-center gap-3 text-sm">
                        {r.status === 'failed' ? (
                          <XCircle className="w-4 h-4 text-destructive shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{r.recipient.business}</div>
                          <div className="text-xs text-muted-foreground truncate">{r.recipient.email}</div>
                          {r.error && <div className="text-xs text-destructive mt-0.5">{r.error}</div>}
                        </div>
                        <Badge variant={r.status === 'failed' ? 'destructive' : 'secondary'}>
                          {r.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign</CardTitle>
                <CardDescription>Used to build idempotency keys.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tag">Campaign tag</Label>
                  <Input
                    id="tag"
                    value={campaignTag}
                    onChange={(e) => setCampaignTag(e.target.value)}
                    disabled={sending}
                  />
                </div>
                <div>
                  <Label htmlFor="delay">Delay between sends (ms)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min={0}
                    max={5000}
                    step={50}
                    value={delayMs}
                    onChange={(e) => setDelayMs(Number(e.target.value) || 0)}
                    disabled={sending}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Smooths out bursts. 750ms is a safe default.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Send</CardTitle>
                <CardDescription>
                  Template: <code className="text-xs">vendor-outreach-invite</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sending && (
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Sending…</span>
                      <span className="font-mono">
                        {progress.done}/{progress.total}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: progress.total
                            ? `${Math.round((progress.done / progress.total) * 100)}%`
                            : '0%',
                        }}
                      />
                    </div>
                  </div>
                )}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSend}
                  disabled={sending || recipients.length === 0}
                >
                  {sending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Send to {recipients.length} vendors</>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Idempotent — re-running won't duplicate sends to the same recipient
                  for the same campaign tag.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
