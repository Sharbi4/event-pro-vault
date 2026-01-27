import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusNotificationRequest {
  booking_id: string;
  status: 'requested' | 'confirmed' | 'declined' | 'cancelled' | 'completed' | 'reminder_7d' | 'reminder_24h' | 'review_request';
  cancelled_by?: 'customer' | 'vendor';
  refund_amount?: number;
}

// Generate ICS calendar content
function generateICSContent(event: {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
}): string {
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z');
  };

  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@eventpros.app`;
  const escapeICS = (str: string) => str.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EventPros//Booking//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(event.startDate)}
DTEND:${formatICSDate(event.endDate)}
SUMMARY:${escapeICS(event.title)}
DESCRIPTION:${escapeICS(event.description)}
LOCATION:${escapeICS(event.location)}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { booking_id, status, cancelled_by, refund_amount }: StatusNotificationRequest = await req.json();

    if (!booking_id || !status) {
      throw new Error("Missing required fields: booking_id and status");
    }

    // Fetch booking with related data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        vendor_packages:package_id(name, cancellation_policy, duration_minutes, setup_time_minutes)
      `)
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Booking not found: ${bookingError?.message}`);
    }

    // Fetch vendor profile
    const { data: vendorProfile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("user_id", booking.vendor_user_id)
      .single();

    // Fetch vendor business name
    const { data: vendorDetails } = await supabase
      .from("vendor_details")
      .select("business_name")
      .eq("user_id", booking.vendor_user_id)
      .single();

    const vendorName = vendorDetails?.business_name || vendorProfile?.display_name || "Event Pro";
    const vendorEmail = vendorProfile?.email;
    const customerEmail = booking.customer_email;
    const packageName = booking.vendor_packages?.name || "Event Package";
    const cancellationPolicy = booking.vendor_packages?.cancellation_policy || 'standard';
    const durationMinutes = booking.vendor_packages?.duration_minutes || 240;

    if (!customerEmail && !vendorEmail) {
      console.log("No email addresses found for notification");
      return new Response(JSON.stringify({ success: true, message: "No recipients" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const eventDate = new Date(booking.event_date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Calculate event end time for calendar
    const eventEndDate = new Date(eventDate.getTime() + (durationMinutes * 60 * 1000));

    // Generate ICS content for calendar invites
    const icsContent = generateICSContent({
      title: `${packageName} with ${vendorName}`,
      description: `Booking with ${vendorName}\nLocation: ${booking.event_location}\nTotal: $${booking.total_price}`,
      location: booking.event_location,
      startDate: eventDate,
      endDate: eventEndDate,
    });

    // Base URL for links
    const baseUrl = supabaseUrl.replace('.supabase.co', '.lovable.app');

    // Email templates based on status
    const emailConfigs: Record<string, { 
      customerSubject?: string; 
      vendorSubject?: string;
      customerHtml?: string;
      vendorHtml?: string;
      includeCalendar?: boolean;
    }> = {
      requested: {
        customerSubject: `📬 Booking Request Sent - ${packageName}`,
        vendorSubject: `🎉 New Booking Request - ${packageName}`,
        customerHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📬 Request Submitted!</h1>
            </div>
            <div style="padding: 32px;">
              <p>Your booking request for <strong>${packageName}</strong> has been sent to ${vendorName}.</p>
              <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p><strong>📅 Event Date:</strong> ${formattedDate}</p>
                <p><strong>📍 Location:</strong> ${booking.event_location}</p>
                <p><strong>💰 Estimated Total:</strong> $${booking.total_price}</p>
              </div>
              <p>The vendor will review your request and respond shortly. You'll receive an email once they accept.</p>
              <center><a href="${baseUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">View in Dashboard →</a></center>
            </div>
          </div>
        `,
        vendorHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎉 New Booking Request!</h1>
            </div>
            <div style="padding: 32px;">
              <p>You have a new booking request for <strong>${packageName}</strong>!</p>
              <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p><strong>📅 Event Date:</strong> ${formattedDate}</p>
                <p><strong>📍 Location:</strong> ${booking.event_location}</p>
                <p><strong>💰 Total:</strong> $${booking.total_price}</p>
                ${booking.notes ? `<p><strong>📝 Notes:</strong> ${booking.notes}</p>` : ''}
              </div>
              <div style="display: flex; gap: 12px; justify-content: center;">
                <a href="${baseUrl}/vendor-dashboard" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">✓ Accept Request</a>
                <a href="${baseUrl}/vendor-dashboard" style="display: inline-block; background: #ef4444; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">✗ Decline</a>
              </div>
            </div>
          </div>
        `,
      },
      confirmed: {
        customerSubject: `✅ Booking Confirmed! - ${packageName}`,
        vendorSubject: `✅ Booking Confirmed - ${packageName}`,
        includeCalendar: true,
        customerHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">✅ Booking Confirmed!</h1>
            </div>
            <div style="padding: 32px;">
              <p>Great news! Your booking with <strong>${vendorName}</strong> for <strong>${packageName}</strong> is confirmed!</p>
              <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0;"><strong>📅 Event Date:</strong> ${formattedDate}</p>
                <p style="margin: 0 0 8px 0;"><strong>📍 Location:</strong> ${booking.event_location}</p>
                <p style="margin: 0;"><strong>💰 Total:</strong> $${booking.total_price}</p>
              </div>
              <div style="background: #fffbeb; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 4px solid #f59e0b;">
                <h4 style="margin: 0 0 8px 0; color: #92400e;">📋 Cancellation Policy: ${CANCELLATION_POLICIES[cancellationPolicy as keyof typeof CANCELLATION_POLICIES]?.name || 'Standard'}</h4>
                <p style="margin: 0; font-size: 13px; color: #92400e;">Review the full policy in your dashboard.</p>
              </div>
              <p style="text-align: center; color: #666;">📎 Calendar invite attached - add it to your calendar!</p>
              <center><a href="${baseUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">View Booking Details →</a></center>
            </div>
          </div>
        `,
        vendorHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">✅ Booking Confirmed</h1>
            </div>
            <div style="padding: 32px;">
              <p>You've confirmed a booking for <strong>${packageName}</strong>!</p>
              <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0;"><strong>📅 Event Date:</strong> ${formattedDate}</p>
                <p style="margin: 0 0 8px 0;"><strong>📍 Location:</strong> ${booking.event_location}</p>
                <p style="margin: 0;"><strong>💰 You'll Receive:</strong> $${(booking.total_price * 0.871).toFixed(2)} (after 12.9% fee)</p>
              </div>
              <p style="text-align: center; color: #666;">📎 Calendar invite attached - add it to your calendar!</p>
              <center><a href="${baseUrl}/vendor-dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">View in Dashboard →</a></center>
            </div>
          </div>
        `,
      },
      declined: {
        customerSubject: `❌ Booking Request Declined - ${packageName}`,
        customerHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #ef4444; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Request Declined</h1>
            </div>
            <div style="padding: 32px;">
              <p>Unfortunately, ${vendorName} was unable to accept your booking request for <strong>${packageName}</strong> on ${formattedDate}.</p>
              <p>Don't worry - there are many other great vendors available!</p>
              <center><a href="${baseUrl}/discover" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Browse Similar Vendors →</a></center>
            </div>
          </div>
        `,
      },
      cancelled: {
        customerSubject: cancelled_by === 'vendor' 
          ? `⚠️ Booking Cancelled by Vendor - ${packageName}`
          : `✓ Booking Cancelled - ${packageName}`,
        vendorSubject: cancelled_by === 'customer'
          ? `⚠️ Customer Cancelled Booking - ${packageName}`
          : `✓ Booking Cancelled - ${packageName}`,
        customerHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #f59e0b; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Booking Cancelled</h1>
            </div>
            <div style="padding: 32px;">
              <p>Your booking for <strong>${packageName}</strong> on ${formattedDate} has been cancelled.</p>
              ${refund_amount !== undefined ? `
                <div style="background: #f0fdf4; border-radius: 8px; padding: 24px; margin: 24px 0;">
                  <h3 style="margin: 0 0 8px 0;">💰 Refund Amount</h3>
                  <p style="font-size: 24px; font-weight: bold; margin: 0; color: #22c55e;">$${refund_amount.toFixed(2)}</p>
                  <p style="margin: 8px 0 0 0; font-size: 13px; color: #666;">Refunds typically take 5-10 business days to process.</p>
                </div>
              ` : ''}
              ${cancelled_by === 'vendor' ? `
                <p style="color: #666;">Since the vendor cancelled, your full payment including deposit has been refunded.</p>
                <center><a href="${baseUrl}/discover" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Find Another Vendor →</a></center>
              ` : ''}
            </div>
          </div>
        `,
        vendorHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #f59e0b; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Booking Cancelled</h1>
            </div>
            <div style="padding: 32px;">
              <p>The booking for <strong>${packageName}</strong> on ${formattedDate} has been cancelled${cancelled_by === 'customer' ? ' by the customer' : ''}.</p>
              <p>The date is now available for other bookings.</p>
            </div>
          </div>
        `,
      },
      reminder_7d: {
        customerSubject: `📅 7-Day Reminder - ${packageName}`,
        vendorSubject: `📅 7-Day Reminder - ${packageName}`,
        customerHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📅 1 Week Until Your Event!</h1>
            </div>
            <div style="padding: 32px;">
              <p>Your event with <strong>${vendorName}</strong> is coming up in 7 days!</p>
              <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p><strong>📅 Date:</strong> ${formattedDate}</p>
                <p><strong>📍 Location:</strong> ${booking.event_location}</p>
              </div>
              <p>Make sure to message your vendor if you have any last-minute questions or changes!</p>
              <center><a href="${baseUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">View Booking →</a></center>
            </div>
          </div>
        `,
        vendorHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📅 Event in 7 Days!</h1>
            </div>
            <div style="padding: 32px;">
              <p>You have a booking for <strong>${packageName}</strong> coming up in 7 days!</p>
              <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p><strong>📅 Date:</strong> ${formattedDate}</p>
                <p><strong>📍 Location:</strong> ${booking.event_location}</p>
              </div>
              <p>Reach out to the customer if you need to confirm any details!</p>
            </div>
          </div>
        `,
      },
      reminder_24h: {
        customerSubject: `⏰ Tomorrow! - ${packageName}`,
        vendorSubject: `⏰ Tomorrow! - ${packageName}`,
        customerHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Your Event is Tomorrow!</h1>
            </div>
            <div style="padding: 32px;">
              <p>Get excited! Your event with <strong>${vendorName}</strong> is tomorrow!</p>
              <div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
                <p style="margin: 0 0 8px 0;"><strong>📍 Location:</strong> ${booking.event_location}</p>
                <p style="margin: 0;"><strong>📦 Package:</strong> ${packageName}</p>
              </div>
              <p style="color: #666;">The vendor will arrive and set up at the scheduled time. Have a great event!</p>
            </div>
          </div>
        `,
        vendorHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Event Tomorrow!</h1>
            </div>
            <div style="padding: 32px;">
              <p>You have a booking for <strong>${packageName}</strong> tomorrow!</p>
              <div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
                <p style="margin: 0 0 8px 0;"><strong>📍 Location:</strong> ${booking.event_location}</p>
                <p style="margin: 0;"><strong>💰 Your Earnings:</strong> $${(booking.total_price * 0.871).toFixed(2)}</p>
              </div>
              <p style="color: #666;">Payout will be released 24 hours after the event ends.</p>
            </div>
          </div>
        `,
      },
      review_request: {
        customerSubject: `⭐ How was your experience? - ${packageName}`,
        customerHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">⭐ How was your event?</h1>
            </div>
            <div style="padding: 32px;">
              <p>We hope you had an amazing experience with <strong>${vendorName}</strong>!</p>
              <p>Your feedback helps other customers find great vendors and helps ${vendorName} improve their service.</p>
              <center><a href="${baseUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">⭐ Leave a Review →</a></center>
            </div>
          </div>
        `,
      },
      completed: {
        vendorSubject: `💰 Payout Scheduled - ${packageName}`,
        vendorHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">💰 Payout Scheduled!</h1>
            </div>
            <div style="padding: 32px;">
              <p>Great job! Your booking for <strong>${packageName}</strong> has been completed.</p>
              <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; color: #666;">Your Earnings</p>
                <p style="font-size: 32px; font-weight: bold; margin: 0; color: #22c55e;">$${(booking.total_price * 0.871).toFixed(2)}</p>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #666;">Will be transferred to your bank account within 2-5 business days.</p>
              </div>
            </div>
          </div>
        `,
      },
    };

    const config = emailConfigs[status];
    if (!config) {
      throw new Error(`Unknown status: ${status}`);
    }

    const results = { customer: false, vendor: false };

    // Base64 encode helper for Deno
    const btoa = (str: string) => {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return globalThis.btoa(binary);
    };

    // Send to customer
    if (customerEmail && config.customerSubject && config.customerHtml) {
      try {
        const attachments = config.includeCalendar ? [
          {
            filename: 'event.ics',
            content: btoa(icsContent),
          }
        ] : undefined;

        await resend.emails.send({
          from: "EventPro <notifications@resend.dev>",
          to: [customerEmail],
          subject: config.customerSubject,
          html: config.customerHtml,
          attachments,
        });
        results.customer = true;
        console.log(`Customer notification sent: ${status}`);
      } catch (e) {
        console.error("Customer email error:", e);
      }
    }

    // Send to vendor
    if (vendorEmail && config.vendorSubject && config.vendorHtml) {
      try {
        const attachments = config.includeCalendar ? [
          {
            filename: 'event.ics',
            content: btoa(icsContent),
          }
        ] : undefined;

        await resend.emails.send({
          from: "EventPro <notifications@resend.dev>",
          to: [vendorEmail],
          subject: config.vendorSubject,
          html: config.vendorHtml,
          attachments,
        });
        results.vendor = true;
        console.log(`Vendor notification sent: ${status}`);
      } catch (e) {
        console.error("Vendor email error:", e);
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-booking-status-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
