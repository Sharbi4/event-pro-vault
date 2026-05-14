import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "atlasmom421@gmail.com";

interface SignupNotificationRequest {
  user_id: string;
  email: string;
  full_name?: string | null;
  source?: string | null;       // 'auth', 'auth-pro', 'auth-booking', etc.
  referral_code?: string | null;
  utm?: Record<string, string> | null;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as SignupNotificationRequest;
    if (!body?.user_id || !body?.email) {
      return new Response(
        JSON.stringify({ error: "user_id and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const utmLines = body.utm
      ? Object.entries(body.utm)
          .map(([k, v]) => `<li><b>${k}:</b> ${v}</li>`)
          .join("")
      : "";

    const html = `
      <h2>🎉 New EventPro signup</h2>
      <p>A new user just created an account.</p>
      <table cellpadding="6" style="border-collapse:collapse;font-family:Inter,sans-serif;">
        <tr><td><b>Email</b></td><td>${body.email}</td></tr>
        <tr><td><b>Name</b></td><td>${body.full_name || "—"}</td></tr>
        <tr><td><b>User ID</b></td><td><code>${body.user_id}</code></td></tr>
        <tr><td><b>Source</b></td><td>${body.source || "unknown"}</td></tr>
        <tr><td><b>Referral</b></td><td>${body.referral_code || "—"}</td></tr>
        <tr><td><b>UTMs</b></td><td>${utmLines ? `<ul>${utmLines}</ul>` : "—"}</td></tr>
        <tr><td><b>Time</b></td><td>${new Date().toUTCString()}</td></tr>
      </table>
    `;

    const { error } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "raw-html",
        recipientEmail: ADMIN_EMAIL,
        idempotencyKey: `admin-signup-${body.user_id}`,
        subject: `🎉 New signup: ${body.email}`,
        html,
        templateData: {
          subject: `🎉 New signup: ${body.email}`,
          html,
        },
      },
    });

    if (error) {
      // Fallback: send via Resend directly if transactional pipeline rejects raw-html
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "EventPro <noreply@vendibook.com>",
            to: [ADMIN_EMAIL],
            subject: `🎉 New signup: ${body.email}`,
            html,
          }),
        });
      } else {
        console.error("notify-admin-signup invoke error", error);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("notify-admin-signup error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
