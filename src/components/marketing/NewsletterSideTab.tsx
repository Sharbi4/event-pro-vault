import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Mail, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const STORAGE_KEY = "newsletter_subscribed_v1";

// Routes where the tab should not appear
const HIDDEN_PREFIXES = [
  "/auth",
  "/signin",
  "/post-auth",
  "/dashboard",
  "/vendor-dashboard",
  "/admin",
  "/eventpro-onboarding",
  "/vendor-onboarding",
  "/onboarding",
  "/booking-success",
  "/unsubscribe",
];

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  city: z.string().trim().max(80).optional(),
});

export function NewsletterSideTab() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) {
      setSubmitted(true);
    }
  }, []);

  const shouldHide = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));
  if (shouldHide) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, city });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: parsed.data.email.toLowerCase(),
      city: parsed.data.city || null,
      source: pathname,
    });
    setLoading(false);
    if (error && !`${error.message}`.toLowerCase().includes("duplicate")) {
      toast.error("Couldn't subscribe. Try again.");
      return;
    }
    localStorage.setItem(STORAGE_KEY, "1");
    setSubmitted(true);
    toast.success("You're on the list. Local Event Pro updates incoming.");
    setTimeout(() => setOpen(false), 1200);
  };

  return (
    <>
      {/* Floating tab trigger */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Subscribe for updates"
          className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 translate-x-0 items-center gap-2 rounded-l-xl border border-r-0 border-border bg-primary px-3 py-4 text-primary-foreground shadow-lg transition-transform hover:-translate-x-0.5 md:flex"
          style={{ writingMode: "vertical-rl" }}
        >
          <Mail className="h-4 w-4 rotate-90" />
          <span className="text-xs font-medium tracking-wide uppercase">
            {submitted ? "Subscribed" : "Get Updates"}
          </span>
        </button>
      )}

      {/* Mobile floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Subscribe for updates"
          className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:hidden"
        >
          {submitted ? <Check className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
        </button>
      )}

      {/* Slide-in panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm transform border-l border-border bg-background shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">Stay in the loop</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                New Event Pros, local pop-ups, and platform updates — straight to your inbox.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {submitted ? (
            <div className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="h-7 w-7" />
              </div>
              <p className="mt-4 font-medium">You're subscribed</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll only email when it matters.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="newsletter-email">Email</Label>
                <Input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  maxLength={255}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newsletter-city">
                  City <span className="text-muted-foreground">(for local alerts)</span>
                </Label>
                <Input
                  id="newsletter-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Atlanta, GA"
                  maxLength={80}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subscribing…
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
    </>
  );
}
