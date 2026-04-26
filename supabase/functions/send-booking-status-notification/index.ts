import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusNotificationRequest {
  booking_id: string;
  status:
    | 'requested'
    | 'confirmed'
    | 'declined'
    | 'cancelled'
    | 'completed'
    | 'reminder_7d'
    | 'reminder_24h'
    | 'review_request';
  cancelled_by?: 'customer' | 'vendor';
  refund_amount?: number;
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

    const { booking_id, status, cancelled_by, refund_amount }: StatusNotificationRequest =
      await req.json();

    if (!booking_id || !status) {
      throw new Error("Missing required fields: booking_id and status");
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        vendor_packages:package_id(name, cancellation_policy)
      `)
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Booking not found: ${bookingError?.message}`);
    }

    const { data: vendorProfile } = await supabase
      .from("profiles")
      .select("display_name, email, first_name")
      .eq("user_id", booking.vendor_user_id)
      .single();

    const { data: vendorDetails } = await supabase
      .from("vendor_details")
      .select("business_name")
      .eq("user_id", booking.vendor_user_id)
      .single();

    const vendorName =
      vendorDetails?.business_name || vendorProfile?.display_name || "Event Pro";
    const vendorEmail = vendorProfile?.email;
    const customerEmail = booking.customer_email;
    const customerName = booking.customer_name || "there";
    const packageName = booking.vendor_packages?.name || "Event Package";

    if (!customerEmail && !vendorEmail) {
      return new Response(
        JSON.stringify({ success: true, message: "No recipients" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const sharedData = {
      customerName,
      vendorName,
      packageName,
      eventDate: booking.event_date,
      eventLocation: booking.event_location,
      totalPrice: Number(booking.total_price ?? 0),
      bookingId: booking.id,
    };

    const sends: Promise<unknown>[] = [];
    const send = (
      recipient: string | null | undefined,
      templateName: string,
      data: Record<string, unknown>,
      tag: string,
    ) => {
      if (!recipient) return;
      sends.push(
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName,
            recipientEmail: recipient,
            idempotencyKey: `${tag}-${booking.id}`,
            templateData: data,
          },
        }),
      );
    };

    switch (status) {
      case 'requested':
        send(customerEmail, "booking-request-received", sharedData, "req-cust");
        send(vendorEmail, "vendor-new-request", sharedData, "req-vend");
        break;

      case 'confirmed':
        send(customerEmail, "booking-confirmation", {
          ...sharedData,
          paymentMethod: booking.payment_method,
        }, "conf-cust");
        // Vendor also gets a confirmation-style note
        send(vendorEmail, "booking-confirmation", {
          ...sharedData,
          customerName: vendorName, // greet vendor by name in their copy
        }, "conf-vend");
        break;

      case 'declined':
        send(customerEmail, "booking-declined", {
          customerName,
          vendorName,
          packageName,
          bookingId: booking.id,
        }, "dec-cust");
        break;

      case 'cancelled':
        send(customerEmail, "refund-issued", {
          ...sharedData,
          refundAmount: refund_amount ?? 0,
          refundDate: new Date().toISOString(),
          reason:
            cancelled_by === 'vendor'
              ? `${vendorName} had to cancel.`
              : `Cancelled per ${booking.vendor_packages?.cancellation_policy ?? 'standard'} policy.`,
        }, "cxl-cust");
        send(vendorEmail, "booking-declined", {
          customerName: vendorName,
          vendorName: customerName,
          packageName,
          reason: `Booking was cancelled${cancelled_by ? ` by the ${cancelled_by}` : ''}.`,
          bookingId: booking.id,
        }, "cxl-vend");
        break;

      case 'completed':
        send(vendorEmail, "payout-sent", {
          vendorName,
          payoutAmount: Number(booking.total_price ?? 0) * 0.871,
          payoutDate: new Date().toISOString(),
          packageName,
          customerName,
          arrivalEstimate: '2–5 business days',
          bookingId: booking.id,
        }, "comp-vend");
        break;

      case 'reminder_7d':
      case 'reminder_24h':
        send(customerEmail, "event-reminder", sharedData, `${status}-cust`);
        send(vendorEmail, "event-reminder", {
          ...sharedData,
          customerName: vendorName,
        }, `${status}-vend`);
        break;

      case 'review_request':
        send(customerEmail, "review-request", {
          customerName,
          vendorName,
          packageName,
          bookingId: booking.id,
        }, "rev-cust");
        break;

      default:
        throw new Error(`Unknown status: ${status}`);
    }

    await Promise.all(sends);

    return new Response(
      JSON.stringify({ success: true, sent: sends.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error in send-booking-status-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
