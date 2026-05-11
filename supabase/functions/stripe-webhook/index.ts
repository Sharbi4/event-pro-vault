import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[STRIPE-WEBHOOK] ${step}`, details ? JSON.stringify(details) : '');
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!signature || !webhookSecret) {
      logStep("Missing signature or webhook secret");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const body = await req.text();
    let event: Stripe.Event;

    try {
      // Use constructEventAsync for Deno compatibility
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: String(err) });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep(`Received event: ${event.type}`);

    switch (event.type) {
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }
      
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }
      
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }
      
      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        logStep(`Transfer created: ${transfer.id} for ${transfer.amount / 100}`);
        break;
      }
      
      case "payout.paid": {
        const payout = event.data.object as Stripe.Payout;
        logStep(`Payout completed: ${payout.id} for ${payout.amount / 100}`);
        break;
      }

      case "identity.verification_session.verified":
      case "identity.verification_session.requires_input":
      case "identity.verification_session.processing":
      case "identity.verification_session.canceled": {
        const session = event.data.object as Stripe.Identity.VerificationSession;
        await handleIdentityVerificationUpdated(session, event.id);
        break;
      }

      default:
        logStep(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Handle Connect account status changes (from Stripe onboarding completion)
async function handleAccountUpdated(account: Stripe.Account) {
  logStep("Account updated", {
    accountId: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  });

  let newStatus = "pending";
  if (account.charges_enabled && account.payouts_enabled) {
    newStatus = "active";
  } else if (account.details_submitted) {
    newStatus = "pending_verification";
  }

  const updateData: Record<string, unknown> = {
    stripe_account_status: newStatus,
  };
  if (newStatus === "active") {
    updateData.onboarding_completed_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update(updateData)
    .eq("stripe_account_id", account.id);

  if (error) {
    logStep("Error updating profile for account.updated", { error: error.message });
  } else {
    logStep("Profile status updated via webhook", { accountId: account.id, newStatus });
  }
}

// Handle Stripe Identity verification status changes
async function handleIdentityVerificationUpdated(
  session: Stripe.Identity.VerificationSession,
  eventId?: string,
) {
  logStep("Identity verification updated", {
    sessionId: session.id,
    status: session.status,
    eventId,
  });

  const userId = session.metadata?.user_id;
  if (!userId) {
    logStep("Identity session missing user_id metadata; skipping", { sessionId: session.id });
    return;
  }

  let newStatus: string = session.status ?? "pending";
  if (session.status === "verified") newStatus = "verified";
  else if (session.status === "requires_input") newStatus = "requires_input";
  else if (session.status === "processing") newStatus = "processing";
  else if (session.status === "canceled") newStatus = "canceled";

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      identity_verification_status: newStatus,
      identity_verification_session_id: session.id,
    })
    .eq("user_id", userId);

  if (error) {
    logStep("Error updating identity status from webhook", { error: error.message });
  } else {
    logStep("Identity status synced via webhook", { userId, newStatus });
  }

  // Append to verification timeline (deduped by stripe_event_id)
  const { error: evtError } = await supabaseAdmin
    .from("identity_verification_events")
    .insert({
      user_id: userId,
      session_id: session.id,
      status: newStatus,
      stripe_event_id: eventId ?? null,
      metadata: {
        last_error: session.last_error ?? null,
        verified_outputs: session.verified_outputs ?? null,
      },
    });

  if (evtError && !evtError.message?.includes("duplicate")) {
    logStep("Error appending identity verification event", { error: evtError.message });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logStep(`PaymentIntent succeeded: ${paymentIntent.id}`);
  
  const metadata = paymentIntent.metadata;
  
  // Handle slot bookings
  if (metadata?.slot_booking_id) {
    const { error } = await supabaseAdmin
      .from("slot_bookings")
      .update({
        payment_status: "paid",
        status: "confirmed",
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata.slot_booking_id);
    
    if (error) {
      logStep("Error updating slot booking", { error: error.message });
    } else {
      logStep(`Slot booking ${metadata.slot_booking_id} marked as paid`);
      if (metadata.slot_inventory_id && metadata.quantity) {
        await decrementSlotInventory(metadata.slot_inventory_id, parseInt(metadata.quantity));
      }
    }
  }
  
  // Handle regular bookings
  if (metadata?.booking_id) {
    // Fetch current state so we don't overwrite existing paid timestamps on
    // retried/duplicate webhook deliveries.
    const { data: existing } = await supabaseAdmin
      .from("bookings")
      .select("deposit_paid_at, final_paid_at, status")
      .eq("id", metadata.booking_id)
      .maybeSingle();

    const updateData: Record<string, unknown> = {
      payment_status: "paid",
      updated_at: new Date().toISOString(),
    };

    if (metadata.payment_type === "deposit") {
      if (!existing?.deposit_paid_at) {
        updateData.deposit_paid_at = new Date().toISOString();
      }
      updateData.stripe_deposit_payment_intent_id = paymentIntent.id;
      updateData.status = "confirmed";
    } else if (metadata.payment_type === "final") {
      if (!existing?.final_paid_at) {
        updateData.final_paid_at = new Date().toISOString();
      }
      updateData.stripe_final_payment_intent_id = paymentIntent.id;
      updateData.status = "completed";
    } else {
      updateData.stripe_payment_intent_id = paymentIntent.id;
      updateData.status = "confirmed";
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update(updateData)
      .eq("id", metadata.booking_id);
    
    if (error) {
      logStep("Error updating booking", { error: error.message });
    } else {
      logStep(`Booking ${metadata.booking_id} payment recorded`);

      // Payment succeeded — NOW notify the vendor and customer.
      // (We deliberately suppressed these on initial booking insert so unpaid
      // online bookings never reach the vendor inbox.)
      if (metadata.payment_type !== "final") {
        try {
          const { data: bookingRow } = await supabaseAdmin
            .from("bookings")
            .select("*")
            .eq("id", metadata.booking_id)
            .single();

          if (bookingRow) {
            // Vendor profile for email
            const { data: vendorProfile } = await supabaseAdmin
              .from("profiles")
              .select("email, full_name, display_name")
              .eq("user_id", bookingRow.vendor_user_id)
              .single();

            const vendorEmail = vendorProfile?.email;
            const vendorName = vendorProfile?.display_name || vendorProfile?.full_name || "Event Pro";
            const isRequest = (bookingRow.booking_mode || "INSTANT").toUpperCase() === "REQUEST";

            // Notify vendor (booking is now in their inbox, paid)
            if (vendorEmail) {
              supabaseAdmin.functions.invoke("send-booking-notification", {
                body: {
                  booking_id: bookingRow.id,
                  vendor_email: vendorEmail,
                  vendor_name: vendorName,
                  customer_name: bookingRow.customer_name || "Customer",
                  customer_email: bookingRow.customer_email,
                  package_name: bookingRow.package_id,
                  event_date: bookingRow.event_date,
                  event_location: bookingRow.event_location,
                  units: bookingRow.units,
                  unit_type: "unit",
                  total_price: bookingRow.total_price,
                  add_ons: bookingRow.add_ons || [],
                  notes: bookingRow.notes,
                  cancellation_policy: "standard",
                },
              }).catch((e) => logStep("Vendor notify failed", { error: String(e) }));
            }

            // Notify customer
            if (bookingRow.customer_email) {
              supabaseAdmin.functions.invoke("send-transactional-email", {
                body: {
                  templateName: isRequest ? "booking-request-received" : "booking-confirmation",
                  recipientEmail: bookingRow.customer_email,
                  idempotencyKey: `booking-paid-${bookingRow.id}`,
                  templateData: {
                    customerName: bookingRow.customer_name || "there",
                    vendorName,
                    packageName: bookingRow.package_id,
                    eventDate: bookingRow.event_date,
                    eventLocation: bookingRow.event_location,
                    units: bookingRow.units,
                    unitType: "unit",
                    totalPrice: bookingRow.total_price,
                    paymentMethod: "stripe",
                    bookingId: bookingRow.id,
                  },
                },
              }).catch((e) => logStep("Customer notify failed", { error: String(e) }));
            }
          }
        } catch (notifyErr) {
          logStep("Post-payment notification error", { error: String(notifyErr) });
        }
      }
    }

    // Mark private package as paid/booked if linked
    if (metadata.private_package_id) {
      const { error: ppError } = await supabaseAdmin
        .from("private_packages")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          booking_id: metadata.booking_id,
        })
        .eq("id", metadata.private_package_id);
      if (ppError) {
        logStep("Error updating private_package", { error: ppError.message });
      } else {
        logStep(`Private package ${metadata.private_package_id} marked paid`);
      }
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  logStep(`PaymentIntent failed: ${paymentIntent.id}`);
  
  const metadata = paymentIntent.metadata;
  
  if (metadata?.slot_booking_id) {
    await supabaseAdmin
      .from("slot_bookings")
      .update({ payment_status: "failed", updated_at: new Date().toISOString() })
      .eq("id", metadata.slot_booking_id);
  }
  
  if (metadata?.booking_id) {
    await supabaseAdmin
      .from("bookings")
      .update({ payment_status: "failed", updated_at: new Date().toISOString() })
      .eq("id", metadata.booking_id);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  logStep(`Checkout session completed: ${session.id}`);
  
  const metadata = session.metadata;
  
  if (metadata?.slot_booking_id) {
    const { error } = await supabaseAdmin
      .from("slot_bookings")
      .update({
        payment_status: "paid",
        status: "confirmed",
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata.slot_booking_id);
    
    if (!error && metadata.slot_inventory_id && metadata.quantity) {
      await decrementSlotInventory(metadata.slot_inventory_id, parseInt(metadata.quantity));
    }
  }
  
  if (metadata?.booking_id) {
    await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: "paid",
        status: "confirmed",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata.booking_id);

    if (metadata.private_package_id) {
      await supabaseAdmin
        .from("private_packages")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          booking_id: metadata.booking_id,
        })
        .eq("id", metadata.private_package_id);
    }
  }
}

async function decrementSlotInventory(inventoryId: string, quantity: number) {
  const { data: inventory, error: fetchError } = await supabaseAdmin
    .from("slot_inventory")
    .select("slots_remaining")
    .eq("id", inventoryId)
    .single();
  
  if (fetchError || !inventory) return;
  
  const newRemaining = Math.max(0, inventory.slots_remaining - quantity);
  await supabaseAdmin
    .from("slot_inventory")
    .update({ slots_remaining: newRemaining, updated_at: new Date().toISOString() })
    .eq("id", inventoryId);
  
  logStep(`Inventory ${inventoryId} decremented by ${quantity}, now ${newRemaining}`);
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  logStep(`Charge refunded: ${charge.id}, amount: ${charge.amount_refunded / 100}`);
  
  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) return;

  const { data: slotBooking } = await supabaseAdmin
    .from("slot_bookings")
    .select("id, quantity, slot_inventory_id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .single();

  if (slotBooking) {
    await supabaseAdmin
      .from("slot_bookings")
      .update({ payment_status: "refunded", status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", slotBooking.id);

    if (slotBooking.slot_inventory_id) {
      const { data: inventory } = await supabaseAdmin
        .from("slot_inventory")
        .select("slots_remaining")
        .eq("id", slotBooking.slot_inventory_id)
        .single();

      if (inventory) {
        await supabaseAdmin
          .from("slot_inventory")
          .update({
            slots_remaining: inventory.slots_remaining + slotBooking.quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", slotBooking.slot_inventory_id);
      }
    }
    return;
  }

  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .or(`stripe_payment_intent_id.eq.${paymentIntentId},stripe_deposit_payment_intent_id.eq.${paymentIntentId},stripe_final_payment_intent_id.eq.${paymentIntentId}`)
    .single();

  if (booking) {
    await supabaseAdmin
      .from("bookings")
      .update({ payment_status: "refunded", status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", booking.id);
  }
}
