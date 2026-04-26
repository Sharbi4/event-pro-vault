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

    const dateOffset = (days: number) => {
      const d = new Date(today);
      d.setDate(today.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    const sevenDaysStr = dateOffset(7);
    const twoDaysStr = dateOffset(2);   // 48-hour reminder
    const oneDayStr = dateOffset(1);    // 24-hour reminder
    const todayStr = dateOffset(0);     // morning-of reminder

    console.log(`Reminders: 7d=${sevenDaysStr}, 48h=${twoDaysStr}, 24h=${oneDayStr}, morning-of=${todayStr}`);

    const fetchConfirmed = async (dateStr: string) => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id")
        .in("status", ["confirmed", "approved", "paid"])
        .eq("event_date", dateStr);
      if (error) console.error(`Fetch error for ${dateStr}:`, error);
      return data ?? [];
    };

    const sevenDayBookings = await fetchConfirmed(sevenDaysStr);
    const twoDayBookings = await fetchConfirmed(twoDaysStr);
    const oneDayBookings = await fetchConfirmed(oneDayStr);
    const morningOfBookings = await fetchConfirmed(todayStr);

    const results: Record<string, { sent: number; errors: number }> = {
      sevenDay: { sent: 0, errors: 0 },
      twoDay: { sent: 0, errors: 0 },
      oneDay: { sent: 0, errors: 0 },
      morningOf: { sent: 0, errors: 0 },
    };

    const sendBatch = async (
      bookings: { id: string }[],
      status: string,
      bucket: keyof typeof results,
    ) => {
      for (const booking of bookings) {
        try {
          await supabase.functions.invoke('send-booking-status-notification', {
            body: { booking_id: booking.id, status },
          });
          results[bucket].sent++;
        } catch (e) {
          console.error(`${status} error for ${booking.id}:`, e);
          results[bucket].errors++;
        }
      }
    };

    await sendBatch(sevenDayBookings, 'reminder_7d', 'sevenDay');
    await sendBatch(twoDayBookings, 'reminder_48h', 'twoDay');
    await sendBatch(oneDayBookings, 'reminder_24h', 'oneDay');
    await sendBatch(morningOfBookings, 'reminder_morning_of', 'morningOf');

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
