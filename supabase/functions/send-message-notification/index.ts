import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MessageNotificationRequest {
  conversationId: string;
  messageContent: string;
  senderType: 'vendor' | 'client';
  senderName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { conversationId, messageContent, senderType, senderName }: MessageNotificationRequest = await req.json();

    if (!conversationId || !messageContent || !senderType) {
      throw new Error("Missing required fields: conversationId, messageContent, senderType");
    }

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      throw new Error("Conversation not found");
    }

    let recipientEmail: string | null = null;
    let recipientName = "there";
    let senderDisplayName = senderName || "Someone";

    if (senderType === 'vendor') {
      recipientEmail = conversation.client_email;
      recipientName = conversation.client_name || "there";
      const { data: vendorProfile } = await supabase
        .from('profiles')
        .select('display_name, first_name, full_name')
        .eq('user_id', conversation.vendor_user_id)
        .single();
      if (vendorProfile) {
        senderDisplayName = vendorProfile.display_name || vendorProfile.first_name || vendorProfile.full_name || "Your Event Pro";
      }
    } else {
      const { data: vendorProfile } = await supabase
        .from('profiles')
        .select('email, display_name, first_name')
        .eq('user_id', conversation.vendor_user_id)
        .single();
      if (vendorProfile) {
        recipientEmail = vendorProfile.email;
        recipientName = vendorProfile.first_name || vendorProfile.display_name || "there";
      }
      senderDisplayName = conversation.client_name || "A customer";
    }

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "No recipient email" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const messagePreview = messageContent.length > 150
      ? messageContent.substring(0, 150) + "..."
      : messageContent;

    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "message-received",
        recipientEmail,
        idempotencyKey: `msg-${conversationId}-${Date.now()}`,
        templateData: {
          recipientName,
          senderName: senderDisplayName,
          preview: messagePreview,
          conversationUrl: "https://eventpro.vendibook.com/dashboard",
        },
      },
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending message notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
