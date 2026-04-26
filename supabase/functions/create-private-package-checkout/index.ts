import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: unknown) =>
  console.log(`[CREATE-PP-CHECKOUT] ${step}`, details ? JSON.stringify(details) : "");

const VENDOR_COMMISSION_PERCENT = 12.9;
const BOOKER_SERVICE_FEE_PERCENT = 12.9;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) throw new Error("Invalid auth");
    const user = userData.user;

    const { private_package_id } = await req.json();
    if (!private_package_id) throw new Error("private_package_id is required");
    log("Request", { private_package_id, user: user.id });

    const { data: pkg, error: pkgErr } = await supabaseAdmin
      .from("private_packages")
      .select("*")
      .eq("id", private_package_id)
      .maybeSingle();
    if (pkgErr || !pkg) throw new Error("Package not found");

    if (pkg.customer_user_id && pkg.customer_user_id !== user.id) {
      throw new Error("This offer was sent to another customer");
    }
    if (!["sent", "viewed", "accepted"].includes(pkg.status)) {
      throw new Error(`Package is ${pkg.status} and cannot be paid`);
    }
    if (pkg.offer_expires_at && new Date(pkg.offer_expires_at) < new Date()) {
      throw new Error("This offer has expired");
    }

    const { data: vendorProfile, error: vErr } = await supabaseAdmin
      .from("profiles")
      .select("stripe_account_id, stripe_account_status, full_name")
      .eq("user_id", pkg.vendor_user_id)
      .maybeSingle();
    if (vErr || !vendorProfile?.stripe_account_id) {
      throw new Error("Vendor has not set up payments");
    }
    if (vendorProfile.stripe_account_status !== "active") {
      throw new Error("Vendor's payment account is not active");
    }

    const customerEmail = user.email || pkg.customer_email;
    if (!customerEmail) throw new Error("Customer email missing");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const totalCents = Math.round(Number(pkg.total_price) * 100);
    const depositCents = pkg.deposit_amount
      ? Math.round(Number(pkg.deposit_amount) * 100)
      : totalCents;
    const finalCents = totalCents - depositCents;

    const bookerServiceFeeCents = Math.round(depositCents * (BOOKER_SERVICE_FEE_PERCENT / 100));
    const customerPaysCents = depositCents + bookerServiceFeeCents;
    const vendorCommissionCents = Math.round(depositCents * (VENDOR_COMMISSION_PERCENT / 100));
    const totalPlatformFeeCents = bookerServiceFeeCents + vendorCommissionCents;

    log("Amounts", {
      totalCents,
      depositCents,
      customerPaysCents,
      totalPlatformFeeCents,
    });

    // Reuse customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    const customerId = customers.data[0]?.id;

    // Pre-create a booking row tied to this private package
    const depositPercentage = depositCents > 0 ? Math.round((depositCents / totalCents) * 100) : 100;

    const { data: bookingRow, error: bErr } = await supabaseAdmin
      .from("bookings")
      .insert({
        user_id: user.id,
        vendor_user_id: pkg.vendor_user_id,
        vendor_id: pkg.vendor_user_id,
        package_id: pkg.id,
        private_package_id: pkg.id,
        booking_type: "private_package",
        booking_mode: "INSTANT",
        event_date: pkg.event_date ?? new Date().toISOString().slice(0, 10),
        event_location: pkg.location ?? "TBD",
        event_city: pkg.event_city,
        event_state: pkg.event_state,
        event_zip: pkg.event_zip,
        address_line1: pkg.address_line1,
        address_line2: pkg.address_line2,
        start_time: pkg.start_time,
        duration_minutes: pkg.service_duration_minutes ?? 60,
        units: 1,
        total_price: pkg.total_price,
        deposit_amount: customerPaysCents,
        deposit_percentage: depositPercentage,
        final_amount: finalCents + Math.round(finalCents * (BOOKER_SERVICE_FEE_PERCENT / 100)),
        platform_fee_amount: totalPlatformFeeCents,
        vendor_stripe_account_id: vendorProfile.stripe_account_id,
        customer_email: customerEmail,
        payment_status: "pending",
        status: "pending",
        notes: pkg.description,
      })
      .select()
      .single();
    if (bErr || !bookingRow) throw new Error(`Failed to create booking: ${bErr?.message}`);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: pkg.package_name,
              description: `Private package deposit. Total: $${(totalCents / 100).toFixed(
                2
              )}. Includes service fee.`,
            },
            unit_amount: customerPaysCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        application_fee_amount: totalPlatformFeeCents,
        transfer_data: { destination: vendorProfile.stripe_account_id },
        metadata: {
          booking_id: bookingRow.id,
          private_package_id: pkg.id,
          payment_type: "deposit",
          vendor_user_id: pkg.vendor_user_id,
        },
      },
      success_url: `${req.headers.get("origin")}/booking-success?booking=${bookingRow.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/private-package/${pkg.id}?cancelled=1`,
      metadata: {
        booking_id: bookingRow.id,
        private_package_id: pkg.id,
        payment_type: "deposit",
        vendor_user_id: pkg.vendor_user_id,
      },
    });

    await supabaseAdmin
      .from("bookings")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", bookingRow.id);

    await supabaseAdmin
      .from("private_packages")
      .update({ status: "accepted", accepted_at: new Date().toISOString(), booking_id: bookingRow.id })
      .eq("id", pkg.id);

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
