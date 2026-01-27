import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function is designed to be called by a cron job daily
// It sends 7-day and 24-hour reminders for upcoming bookings
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get dates for 7 days and 1 day from now
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    const oneDayFromNow = new Date(today);
    oneDayFromNow.setDate(today.getDate() + 1);

    const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0];
    const oneDayStr = oneDayFromNow.toISOString().split('T')[0];

    console.log(`Checking for reminders: 7-day (${sevenDaysStr}), 24-hour (${oneDayStr})`);

    // Get confirmed bookings for 7-day reminder
    const { data: sevenDayBookings, error: error7d } = await supabase
      .from("bookings")
      .select("id")
      .eq("status", "confirmed")
      .eq("event_date", sevenDaysStr);

    if (error7d) {
      console.error("Error fetching 7-day bookings:", error7d);
    }

    // Get confirmed bookings for 24-hour reminder
    const { data: oneDayBookings, error: error1d } = await supabase
      .from("bookings")
      .select("id")
      .eq("status", "confirmed")
      .eq("event_date", oneDayStr);

    if (error1d) {
      console.error("Error fetching 24-hour bookings:", error1d);
    }

    const results = {
      sevenDay: { sent: 0, errors: 0 },
      oneDay: { sent: 0, errors: 0 },
    };

    // Send 7-day reminders
    for (const booking of sevenDayBookings || []) {
      try {
        await supabase.functions.invoke('send-booking-status-notification', {
          body: { booking_id: booking.id, status: 'reminder_7d' }
        });
        results.sevenDay.sent++;
      } catch (e) {
        console.error(`7-day reminder error for ${booking.id}:`, e);
        results.sevenDay.errors++;
      }
    }

    // Send 24-hour reminders
    for (const booking of oneDayBookings || []) {
      try {
        await supabase.functions.invoke('send-booking-status-notification', {
          body: { booking_id: booking.id, status: 'reminder_24h' }
        });
        results.oneDay.sent++;
      } catch (e) {
        console.error(`24-hour reminder error for ${booking.id}:`, e);
        results.oneDay.errors++;
      }
    }

    // Check for completed events (event date was yesterday) and send review requests
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: completedBookings, error: errorCompleted } = await supabase
      .from("bookings")
      .select("id")
      .eq("status", "completed")
      .eq("event_date", yesterdayStr);

    if (!errorCompleted && completedBookings) {
      for (const booking of completedBookings) {
        try {
          await supabase.functions.invoke('send-booking-status-notification', {
            body: { booking_id: booking.id, status: 'review_request' }
          });
        } catch (e) {
          console.error(`Review request error for ${booking.id}:`, e);
        }
      }
    }

    console.log("Reminder results:", results);

    return new Response(JSON.stringify({ 
      success: true, 
      results,
      checked: {
        sevenDayBookings: sevenDayBookings?.length || 0,
        oneDayBookings: oneDayBookings?.length || 0,
        completedBookings: completedBookings?.length || 0,
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-event-reminders:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
