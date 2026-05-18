import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactRequest = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (message.length < 10 || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message must be between 10 and 2000 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1) Auto-reply branded confirmation to the user
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "contact-form-confirmation",
        recipientEmail: email,
        idempotencyKey: `contact-ack-${email}-${Date.now()}`,
        templateData: { name, subject, message },
      },
    });

    // 2) Notify support team + forward to admin owner
    const teamRecipients = ["support@vendibook.com", "atlasmom421@gmail.com"];
    for (const to of teamRecipients) {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "contact-form-confirmation",
          recipientEmail: to,
          idempotencyKey: `contact-team-${to}-${email}-${Date.now()}`,
          templateData: {
            name: `Support copy — from ${name} <${email}>`,
            subject,
            message,
          },
        },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
