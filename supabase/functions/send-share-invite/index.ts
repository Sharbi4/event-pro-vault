import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const origin = req.headers.get("origin") || "https://eventpro.vendibook.com";
    const link = `${origin}/r/${share_code}`;

    // Use service-role client to invoke send-transactional-email
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await adminClient.functions.invoke("send-transactional-email", {
      body: {
        templateName: "message-received",
        recipientEmail: recipient_email,
        idempotencyKey: `share-${share_code}-${recipient_email}`,
        templateData: {
          recipientName: "there",
          senderName: user.email,
          preview: package_name
            ? `You've been invited to book ${package_name}. ${(message ?? '').slice(0, 200)}`
            : (message ?? `You've been invited on EventPros`).slice(0, 240),
          conversationUrl: link,
        },
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("send-share-invite error:", e);
    return new Response(JSON.stringify({ error: e.message ?? "Failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
