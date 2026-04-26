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
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "payment-reminder",
            recipientEmail: booking.customer_email,
            idempotencyKey: `pay-reminder-${booking.id}-${reminderType}`,
            templateData: {
              packageName: "your booking",
              amountDue: finalAmount,
              dueDate: booking.event_date,
              bookingId: booking.id,
              paymentUrl: "https://eventpro.vendibook.com/dashboard",
            },
          },
        });
        console.log(`Reminder enqueued for booking ${booking.id}`);

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
