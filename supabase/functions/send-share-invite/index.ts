import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");
    const token = authHeader.replace("Bearer ", "");
    const { data: u } = await supabase.auth.getUser(token);
    const user = u.user;
    if (!user?.email) throw new Error("Unauthorized");

    const body = await req.json();
    const { recipient_email, message, share_code, package_name } = body ?? {};

    if (!recipient_email || !share_code) {
      return new Response(JSON.stringify({ error: "recipient_email and share_code required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const origin = req.headers.get("origin") || "https://event-pro-vault.lovable.app";
    const link = `${origin}/r/${share_code}`;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const subject = package_name
      ? `${user.email} invited you to book ${package_name} on EventPros`
      : `${user.email} invited you on EventPros`;

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
        <h2 style="margin:0 0 12px">You're invited 🎉</h2>
        <p style="white-space:pre-wrap">${(message ?? '').toString().slice(0, 1000)}</p>
        <p style="margin-top:24px">
          <a href="${link}" style="background:#111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block">
            View on EventPros →
          </a>
        </p>
        <p style="font-size:12px;color:#888;margin-top:24px">
          Sent via the EventPros Share Kit by ${user.email}
        </p>
      </div>
    `;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "EventPros <onboarding@resend.dev>",
        to: [recipient_email],
        subject,
        html,
        reply_to: user.email,
      }),
    });

    const result = await resp.json();
    if (!resp.ok) throw new Error(result?.message ?? "Resend error");

    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
