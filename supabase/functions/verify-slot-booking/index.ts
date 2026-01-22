import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    // Check if booking already exists for this session
    const { data: existingBooking } = await supabaseAdmin
      .from('slot_bookings')
      .select('id')
      .eq('stripe_checkout_session_id', sessionId)
      .maybeSingle();

    if (existingBooking) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Booking already confirmed",
          bookingId: existingBooking.id 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Extract metadata
    const meta = session.metadata || {};
    const inventoryIds = JSON.parse(meta.inventoryIds || '[]');
    const isRecurring = meta.isRecurring === 'true';
    
    // Get market and slot type details for email
    const { data: market } = await supabaseAdmin
      .from('markets')
      .select('name, formatted_address, user_id')
      .eq('id', meta.marketId)
      .single();

    const { data: slotType } = await supabaseAdmin
      .from('slot_types')
      .select('name')
      .eq('id', meta.slotTypeId)
      .single();

    // Get market host profile for email
    let hostEmail = '';
    let hostName = 'Market Host';
    if (market) {
      const { data: hostProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, display_name')
        .eq('user_id', market.user_id)
        .single();
      
      // Get host email from auth
      const { data: hostAuth } = await supabaseAdmin.auth.admin.getUserById(market.user_id);
      hostEmail = hostAuth?.user?.email || '';
      hostName = hostProfile?.display_name || hostProfile?.full_name || 'Market Host';
    }

    // Get inventory dates and times for email
    const slotDates: string[] = [];
    let slotTime = '';
    for (const invId of inventoryIds) {
      const { data: inv } = await supabaseAdmin
        .from('slot_inventory')
        .select('date, start_time, end_time')
        .eq('id', invId)
        .single();
      if (inv) {
        slotDates.push(inv.date);
        if (!slotTime) {
          slotTime = `${inv.start_time} - ${inv.end_time}`;
        }
      }
    }
    
    // Create bookings for each inventory slot
    const bookingIds: string[] = [];
    let parentBookingId: string | null = null;

    for (let i = 0; i < inventoryIds.length; i++) {
      const invId = inventoryIds[i];
      
      // Get current inventory
      const { data: inventory, error: invError } = await supabaseAdmin
        .from('slot_inventory')
        .select('slots_remaining')
        .eq('id', invId)
        .single();

      if (invError || !inventory || inventory.slots_remaining <= 0) {
        console.error(`Inventory ${invId} no longer available`);
        continue; // Skip this one but continue with others
      }

      // Create booking
      const bookingData: Record<string, unknown> = {
        slot_inventory_id: invId,
        slot_type_id: meta.slotTypeId,
        market_id: meta.marketId,
        user_id: meta.userId,
        vendor_user_id: meta.vendorUserId,
        quantity: 1,
        total_price: parseFloat(meta.totalAmount) / inventoryIds.length,
        base_amount: parseFloat(meta.baseAmount) / inventoryIds.length,
        platform_fee_rate: 0.129,
        platform_fee_amount: parseFloat(meta.platformFeeAmount) / inventoryIds.length,
        status: 'confirmed',
        payment_status: 'paid',
        payment_method: 'stripe',
        stripe_checkout_session_id: sessionId,
        stripe_payment_intent_id: session.payment_intent as string,
        vendor_name: meta.vendorName || null,
        vendor_email: meta.vendorEmail || null,
        vendor_phone: meta.vendorPhone || null,
        vendor_category: meta.vendorCategory || null,
        vendor_type: meta.vendorType || null,
        booth_size: meta.boothSize || null,
        truck_length_feet: meta.truckLengthFeet ? parseInt(meta.truckLengthFeet) : null,
        has_generator: meta.hasGenerator === 'true',
        needs_power: meta.needsPower === 'true',
        power_amps: meta.powerAmps ? parseInt(meta.powerAmps) : null,
        needs_water: meta.needsWater === 'true',
        needs_wifi: meta.needsWifi === 'true',
        arrival_time: meta.arrivalTime || null,
        setup_notes: meta.setupNotes || null,
        notes: meta.notes || null,
        is_recurring: isRecurring,
        recurring_parent_id: parentBookingId,
        recurring_week_number: isRecurring ? i + 1 : null,
      };

      const { data: bookingResult, error: bookingError } = await supabaseAdmin
        .from('slot_bookings')
        .insert(bookingData)
        .select('id')
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        throw bookingError;
      }

      bookingIds.push((bookingResult as { id: string }).id);
      
      // Set parent ID for recurring
      if (isRecurring && i === 0) {
        parentBookingId = (bookingResult as { id: string }).id;
      }

      // Decrement inventory
      await supabaseAdmin
        .from('slot_inventory')
        .update({ 
          slots_remaining: inventory.slots_remaining - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', invId);
    }

    // Send email notifications to vendor and market host
    if (bookingIds.length > 0 && meta.vendorEmail && hostEmail) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
        
        const notificationPayload = {
          booking_id: bookingIds[0],
          market_name: market?.name || 'Market',
          market_address: market?.formatted_address || '',
          slot_type_name: slotType?.name || 'Vendor Spot',
          slot_dates: slotDates,
          slot_time: slotTime,
          is_recurring: isRecurring,
          recurring_weeks: inventoryIds.length,
          vendor_name: meta.vendorName || '',
          vendor_email: meta.vendorEmail || '',
          vendor_phone: meta.vendorPhone || '',
          vendor_category: meta.vendorCategory || '',
          vendor_type: meta.vendorType || '',
          booth_size: meta.boothSize || null,
          needs_power: meta.needsPower === 'true',
          power_amps: meta.powerAmps ? parseInt(meta.powerAmps) : null,
          needs_water: meta.needsWater === 'true',
          needs_wifi: meta.needsWifi === 'true',
          has_generator: meta.hasGenerator === 'true',
          arrival_time: meta.arrivalTime || null,
          setup_notes: meta.setupNotes || null,
          host_email: hostEmail,
          host_name: hostName,
          base_amount: parseFloat(meta.baseAmount) || 0,
          platform_fee: parseFloat(meta.platformFeeAmount) || 0,
          total_amount: parseFloat(meta.totalAmount) || 0,
        };

        const emailResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-slot-booking-notification`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify(notificationPayload),
          }
        );

        const emailResult = await emailResponse.json();
        console.log('Email notification result:', emailResult);
      } catch (emailError) {
        // Log but don't fail the booking if email fails
        console.error('Failed to send email notifications:', emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${bookingIds.length} booking(s) confirmed`,
        bookingIds 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error('Error verifying booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
