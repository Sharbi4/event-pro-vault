import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Booking {
  id: string;
  customer_email: string | null;
  event_date: string;
  event_location: string;
  total_price: number;
  final_amount: number | null;
  deposit_paid_at: string | null;
  final_paid_at: string | null;
  status: string;
  vendor_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Payment reminder function triggered");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    // Get bookings that need reminders
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .not("deposit_paid_at", "is", null)
      .is("final_paid_at", null)
      .in("status", ["confirmed", "pending"])
      .gte("event_date", today.toISOString().split("T")[0]);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      throw new Error(`Failed to fetch bookings: ${bookingsError.message}`);
    }

    console.log(`Found ${bookings?.length || 0} bookings to check for reminders`);

    const results = {
      processed: 0,
      emailsSent: 0,
      errors: [] as string[],
    };

    for (const booking of bookings || []) {
      if (!booking.customer_email) {
        console.log(`Skipping booking ${booking.id} - no customer email`);
        continue;
      }

      const eventDate = new Date(booking.event_date);
      const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let reminderType: string | null = null;
      let subject = "";
      let urgencyText = "";

      // Determine which reminder to send based on days until event
      if (daysUntilEvent === 0) {
        reminderType = "final_payment_due";
        subject = "🚨 Final Payment Due Today - EventPro Booking";
        urgencyText = "Your event is TODAY and your final payment is due now.";
      } else if (daysUntilEvent <= 3 && daysUntilEvent > 0) {
        reminderType = "final_payment_3_days";
        subject = "⏰ Final Payment Due Soon - EventPro Booking";
        urgencyText = `Your event is in ${daysUntilEvent} day${daysUntilEvent === 1 ? '' : 's'} and your final payment is due.`;
      } else if (daysUntilEvent <= 7 && daysUntilEvent > 3) {
        reminderType = "final_payment_7_days";
        subject = "📅 Final Payment Reminder - EventPro Booking";
        urgencyText = `Your event is in ${daysUntilEvent} days. Please complete your final payment soon.`;
      }

      if (!reminderType) {
        continue;
      }

      // Check if this reminder was already sent
      const { data: existingReminder } = await supabase
        .from("payment_reminders")
        .select("id")
        .eq("booking_id", booking.id)
        .eq("reminder_type", reminderType)
        .single();

      if (existingReminder) {
        console.log(`Reminder ${reminderType} already sent for booking ${booking.id}`);
        continue;
      }

      results.processed++;

      const finalAmount = booking.final_amount || (booking.total_price - (booking.deposit_paid_at ? booking.total_price * 0.25 : 0));
      const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(finalAmount);

      const eventDateFormatted = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(eventDate);

      try {
        const emailResponse = await resend.emails.send({
          from: "EventPro <notifications@resend.dev>",
          to: [booking.customer_email],
          subject: subject,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #FF6B35, #F7C948); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .header h1 { color: white; margin: 0; font-size: 24px; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                .amount-box { background: #f8f9fa; border: 2px solid #FF6B35; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
                .amount { font-size: 32px; font-weight: bold; color: #FF6B35; }
                .urgency { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                .details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #FF6B35, #F7C948); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>EventPro by Vendibook</h1>
                </div>
                <div class="content">
                  <h2>Payment Reminder</h2>
                  <div class="urgency">
                    <strong>⚠️ ${urgencyText}</strong>
                  </div>
                  
                  <div class="amount-box">
                    <p style="margin: 0 0 10px 0; color: #666;">Final Amount Due</p>
                    <div class="amount">${formattedAmount}</div>
                  </div>
                  
                  <div class="details">
                    <h3 style="margin-top: 0;">Event Details</h3>
                    <p><strong>📅 Date:</strong> ${eventDateFormatted}</p>
                    <p><strong>📍 Location:</strong> ${booking.event_location}</p>
                    <p><strong>💰 Total Booking:</strong> ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(booking.total_price)}</p>
                  </div>
                  
                  <p>To ensure your vendor is confirmed for your event, please complete your payment as soon as possible.</p>
                  
                  <center>
                    <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/dashboard" class="cta-button">
                      Complete Payment →
                    </a>
                  </center>
                  
                  <p style="color: #666; font-size: 14px;">If you have any questions or need to make changes to your booking, please contact us through your dashboard.</p>
                </div>
                <div class="footer">
                  <p>© 2024 EventPro by Vendibook. All rights reserved.</p>
                  <p>This is an automated reminder for your upcoming event booking.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`Email sent successfully for booking ${booking.id}:`, emailResponse);

        // Record that this reminder was sent
        await supabase.from("payment_reminders").insert({
          booking_id: booking.id,
          reminder_type: reminderType,
        });

        results.emailsSent++;
      } catch (emailError: any) {
        console.error(`Error sending email for booking ${booking.id}:`, emailError);
        results.errors.push(`Booking ${booking.id}: ${emailError.message}`);
      }
    }

    console.log("Payment reminder results:", results);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-payment-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
