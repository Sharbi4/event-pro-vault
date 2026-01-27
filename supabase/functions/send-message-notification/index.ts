import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { conversationId, messageContent, senderType, senderName }: MessageNotificationRequest = await req.json();

    if (!conversationId || !messageContent || !senderType) {
      throw new Error("Missing required fields: conversationId, messageContent, senderType");
    }

    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      console.error("Conversation not found:", convError);
      throw new Error("Conversation not found");
    }

    let recipientEmail: string | null = null;
    let recipientName: string = "there";
    let senderDisplayName = senderName || "Someone";

    if (senderType === 'vendor') {
      // Vendor sent message → notify client
      recipientEmail = conversation.client_email;
      recipientName = conversation.client_name || "there";
      
      // Get vendor name from profiles
      const { data: vendorProfile } = await supabase
        .from('profiles')
        .select('display_name, first_name, full_name')
        .eq('user_id', conversation.vendor_user_id)
        .single();
      
      if (vendorProfile) {
        senderDisplayName = vendorProfile.display_name || vendorProfile.first_name || vendorProfile.full_name || "Your Event Pro";
      }
    } else {
      // Client sent message → notify vendor
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
      console.log("No recipient email found, skipping notification");
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "No recipient email" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Truncate message preview
    const messagePreview = messageContent.length > 150 
      ? messageContent.substring(0, 150) + "..." 
      : messageContent;

    const subject = conversation.subject 
      ? `New message: ${conversation.subject}`
      : `New message from ${senderDisplayName}`;

    const emailResponse = await resend.emails.send({
      from: "EventPros <notifications@eventpros.app>",
      to: [recipientEmail],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Message</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 20px;">Hi ${recipientName},</p>
            
            <p style="margin: 0 0 20px;"><strong>${senderDisplayName}</strong> sent you a message:</p>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0; color: #4b5563; font-style: italic;">"${messagePreview}"</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://event-pro-vault.lovable.app/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
                View & Reply
              </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              You received this email because you have an active conversation on EventPros.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Message notification email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
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
