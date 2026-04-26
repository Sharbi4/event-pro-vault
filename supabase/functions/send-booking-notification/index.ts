import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  add_ons?: string[];
  notes?: string | null;
  cancellation_policy?: 'flexible' | 'standard' | 'strict';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: BookingNotificationRequest = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const sharedData = {
      vendorName: body.vendor_name,
      customerName: body.customer_name,
      packageName: body.package_name,
      eventDate: body.event_date,
      eventLocation: body.event_location,
      totalPrice: body.total_price,
      bookingId: body.booking_id,
    };

    // Notify vendor of new request
    if (body.vendor_email) {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "vendor-new-request",
          recipientEmail: body.vendor_email,
          idempotencyKey: `vendor-request-${body.booking_id}`,
          templateData: sharedData,
        },
      });
    }

    // Confirm receipt to customer
    if (body.customer_email) {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "booking-request-received",
          recipientEmail: body.customer_email,
          idempotencyKey: `customer-request-${body.booking_id}`,
          templateData: {
            ...sharedData,
            units: body.units,
            unitType: body.unit_type,
          },
        },
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-booking-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
