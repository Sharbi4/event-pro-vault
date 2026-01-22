import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SlotBookingNotificationRequest {
  // Booking details
  booking_id: string;
  market_name: string;
  market_address: string;
  slot_type_name: string;
  slot_dates: string[];
  slot_time: string;
  is_recurring: boolean;
  recurring_weeks: number;
  
  // Vendor (booker) details
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  vendor_category: string;
  vendor_type: string;
  
  // Setup requirements
  booth_size?: string;
  needs_power?: boolean;
  power_amps?: number;
  needs_water?: boolean;
  needs_wifi?: boolean;
  has_generator?: boolean;
  arrival_time?: string;
  setup_notes?: string;
  
  // Market host details
  host_email: string;
  host_name: string;
  
  // Payment
  base_amount: number;
  platform_fee: number;
  total_amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: SlotBookingNotificationRequest = await req.json();

    console.log("Sending slot booking notifications for:", data.booking_id);
    console.log("Vendor email:", data.vendor_email);
    console.log("Host email:", data.host_email);

    // Format dates
    const formattedDates = data.slot_dates.map(date => 
      new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    ).join(', ');

    // Build setup requirements list
    const setupRequirements: string[] = [];
    if (data.booth_size) setupRequirements.push(`Booth Size: ${data.booth_size}`);
    if (data.needs_power) setupRequirements.push(`Power: ${data.power_amps || 'Standard'} amps`);
    if (data.needs_water) setupRequirements.push('Water hookup');
    if (data.needs_wifi) setupRequirements.push('WiFi access');
    if (data.has_generator) setupRequirements.push('Has own generator');
    if (data.arrival_time) setupRequirements.push(`Arrival: ${data.arrival_time}`);
    
    const setupList = setupRequirements.length > 0 
      ? setupRequirements.map(r => `<li>${r}</li>`).join('') 
      : '<li>None specified</li>';

    // === EMAIL TO VENDOR (person who booked) ===
    const vendorEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Booking Confirmed!</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
              Hi ${data.vendor_name},
            </p>
            
            <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
              Great news! Your vendor spot at <strong>${data.market_name}</strong> has been confirmed.
            </p>
            
            <!-- Market Details Card -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 16px 0;">📍 Market Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Market:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.market_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Location:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${data.market_address}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Spot Type:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.slot_type_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date(s):</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">📅 ${formattedDates}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">🕐 ${data.slot_time}</td>
                </tr>
                ${data.is_recurring ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Recurring:</td>
                  <td style="padding: 8px 0; color: #10b981; font-size: 14px; font-weight: 500;">✓ ${data.recurring_weeks} weeks</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- Payment Summary -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 8px 0;">Amount Paid</p>
              <p style="color: white; font-size: 32px; font-weight: bold; margin: 0;">$${data.total_amount.toLocaleString()}</p>
            </div>
            
            <!-- What's Next -->
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h3 style="color: #92400e; font-size: 16px; margin: 0 0 12px 0;">📋 What's Next?</h3>
              <ul style="color: #92400e; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Arrive at ${data.arrival_time || 'the scheduled setup time'}</li>
                <li>Check in with the market host upon arrival</li>
                <li>Set up your booth in the designated area</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Questions? Contact the market host at <a href="mailto:${data.host_email}" style="color: #10b981;">${data.host_email}</a>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is an automated confirmation. Please save this email for your records.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // === EMAIL TO HOST (market owner) ===
    const hostEmailHtml = `
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
            <h1 style="color: white; margin: 0; font-size: 24px;">🛒 New Vendor Booking!</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
              Hi ${data.host_name},
            </p>
            
            <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
              A new vendor has booked a spot at <strong>${data.market_name}</strong>!
            </p>
            
            <!-- Vendor Details Card -->
            <div style="background-color: #f0fdf4; border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #10b981;">
              <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 16px 0;">👤 Vendor Information</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Name:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.vendor_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
                  <td style="padding: 8px 0; color: #6366f1; font-size: 14px;"><a href="mailto:${data.vendor_email}" style="color: #6366f1;">${data.vendor_email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Phone:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px;"><a href="tel:${data.vendor_phone}" style="color: #6366f1;">${data.vendor_phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Category:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${data.vendor_category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Vendor Type:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${data.vendor_type}</td>
                </tr>
              </table>
            </div>
            
            <!-- Booking Details Card -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 16px 0;">📋 Booking Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Spot Type:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.slot_type_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date(s):</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">📅 ${formattedDates}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">🕐 ${data.slot_time}</td>
                </tr>
                ${data.is_recurring ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Recurring:</td>
                  <td style="padding: 8px 0; color: #10b981; font-size: 14px; font-weight: 500;">✓ ${data.recurring_weeks} weeks booked</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- Setup Requirements -->
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h3 style="color: #92400e; font-size: 16px; margin: 0 0 12px 0;">⚡ Setup Requirements</h3>
              <ul style="color: #92400e; font-size: 14px; margin: 0; padding-left: 20px;">
                ${setupList}
              </ul>
              ${data.setup_notes ? `
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #fcd34d;">
                <p style="color: #92400e; font-size: 14px; margin: 0;"><strong>Notes:</strong> ${data.setup_notes}</p>
              </div>
              ` : ''}
            </div>
            
            <!-- Earnings -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 8px 0;">Your Earnings</p>
              <p style="color: white; font-size: 32px; font-weight: bold; margin: 0;">$${data.base_amount.toLocaleString()}</p>
              <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 8px 0 0 0;">(Total: $${data.total_amount.toLocaleString()} - $${data.platform_fee.toFixed(2)} platform fee)</p>
            </div>
            
            <p style="color: #374151; font-size: 14px; text-align: center; margin-bottom: 24px;">
              View and manage this booking in your dashboard.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is an automated notification. Booking ID: ${data.booking_id}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send both emails
    const [vendorEmailResult, hostEmailResult] = await Promise.all([
      resend.emails.send({
        from: "Bookings <onboarding@resend.dev>",
        to: [data.vendor_email],
        subject: `✓ Booking Confirmed: ${data.slot_type_name} at ${data.market_name}`,
        html: vendorEmailHtml,
      }),
      resend.emails.send({
        from: "Bookings <onboarding@resend.dev>",
        to: [data.host_email],
        subject: `New Vendor Booking: ${data.vendor_name} - ${data.slot_type_name}`,
        html: hostEmailHtml,
      }),
    ]);

    console.log("Vendor email sent:", vendorEmailResult);
    console.log("Host email sent:", hostEmailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        vendorEmail: vendorEmailResult,
        hostEmail: hostEmailResult 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error sending slot booking notifications:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
