import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  booking_id: string;
  vendor_email: string;
  vendor_name: string;
  customer_name: string;
  customer_email: string;
  package_name: string;
  event_date: string;
  event_location: string;
  units: number;
  unit_type: string;
  total_price: number;
  add_ons: string[];
  notes?: string | null;
  cancellation_policy?: 'flexible' | 'standard' | 'strict';
}

const CANCELLATION_POLICIES = {
  flexible: {
    name: 'Flexible',
    tiers: [
      { label: '48+ hours before', refund: '100%' },
      { label: '24-48 hours before', refund: '50%' },
      { label: 'Less than 24 hours', refund: 'No refund' },
    ],
  },
  standard: {
    name: 'Standard',
    tiers: [
      { label: '7+ days before', refund: '100%' },
      { label: '3-7 days before', refund: '50%' },
      { label: 'Less than 72 hours', refund: 'No refund' },
    ],
  },
  strict: {
    name: 'Strict',
    tiers: [
      { label: '14+ days before', refund: '100%' },
      { label: '7-14 days before', refund: '50%' },
      { label: 'Less than 7 days', refund: 'No refund' },
    ],
  },
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      booking_id,
      vendor_email,
      vendor_name,
      customer_name,
      customer_email,
      package_name,
      event_date,
      event_location,
      units,
      unit_type,
      total_price,
      add_ons,
      notes,
      cancellation_policy,
    }: BookingNotificationRequest = await req.json();

    // Get policy details for email
    const policy = cancellation_policy ? CANCELLATION_POLICIES[cancellation_policy] : CANCELLATION_POLICIES.standard;
    const policyHtml = `
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid #bbf7d0;">
        <h3 style="color: #166534; font-size: 16px; margin: 0 0 12px 0;">📋 Cancellation Policy: ${policy.name}</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${policy.tiers.map(tier => `
            <tr>
              <td style="padding: 6px 0; color: #166534; font-size: 13px;">${tier.label}</td>
              <td style="padding: 6px 0; color: #166534; font-size: 13px; font-weight: 500; text-align: right;">${tier.refund}</td>
            </tr>
          `).join('')}
        </table>
        <p style="color: #15803d; font-size: 11px; margin: 12px 0 0 0; font-style: italic;">
          Platform fees are non-refundable. Contact support for questions.
        </p>
      </div>
    `;

    console.log("Sending booking notification email to vendor:", vendor_email);
    console.log("Booking details:", { booking_id, package_name, event_date });

    // Format the add-ons list
    const addOnsList = add_ons.length > 0 
      ? add_ons.map(a => `<li>${a}</li>`).join("") 
      : "<li>None selected</li>";

    // Format the date nicely
    const formattedDate = new Date(event_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailResponse = await resend.emails.send({
      from: "Bookings <onboarding@resend.dev>",
      to: [vendor_email],
      subject: `New Booking Request: ${package_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎉 New Booking Request!</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
                Hi ${vendor_name},
              </p>
              
              <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
                Great news! You've received a new booking request for <strong>${package_name}</strong>.
              </p>
              
              <!-- Booking Details Card -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 16px 0;">📋 Booking Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Customer:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${customer_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
                    <td style="padding: 8px 0; color: #6366f1; font-size: 14px;"><a href="mailto:${customer_email}" style="color: #6366f1;">${customer_email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Event Date:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">📅 ${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Location:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">📍 ${event_location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Duration:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${units} ${unit_type}${units > 1 ? 's' : ''}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Add-ons -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 12px 0;">✨ Selected Add-ons</h3>
                <ul style="color: #374151; font-size: 14px; margin: 0; padding-left: 20px;">
                  ${addOnsList}
                </ul>
              </div>
              
              ${notes ? `
              <!-- Special Requests -->
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="color: #92400e; font-size: 16px; margin: 0 0 12px 0;">📝 Special Requests</h3>
                <p style="color: #92400e; font-size: 14px; margin: 0;">${notes}</p>
              </div>
              ` : ''}
              
              <!-- Cancellation Policy -->
              ${policyHtml}
              
              <!-- Total -->
              <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 8px 0;">Estimated Total</p>
                <p style="color: white; font-size: 32px; font-weight: bold; margin: 0;">$${total_price.toLocaleString()}</p>
              </div>
              
              <!-- Action -->
              <p style="color: #374151; font-size: 14px; text-align: center; margin-bottom: 24px;">
                Log in to your dashboard to review and respond to this booking request.
              </p>
              
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This is an automated notification. Please do not reply to this email.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending booking notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
