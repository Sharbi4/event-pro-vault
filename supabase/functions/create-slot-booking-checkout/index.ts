import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SlotBookingRequest {
  marketId: string;
  marketName: string;
  slotTypeId: string;
  slotTypeName: string;
  inventoryIds: string[];
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  vendorCategory: string;
  vendorType: string;
  boothSize?: string;
  truckLengthFeet?: number;
  hasGenerator?: boolean;
  needsPower?: boolean;
  powerAmps?: number;
  needsWater?: boolean;
  needsWifi?: boolean;
  arrivalTime?: string;
  setupNotes?: string;
  notes?: string;
  isRecurring: boolean;
  baseAmount: number;
  platformFeeAmount: number;
  totalAmount: number;
  // Guest checkout - email provided directly
  guestEmail?: string;
}

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
    // Try to get authenticated user (optional for guest checkout)
    const authHeader = req.headers.get("Authorization");
    let user = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
    }

    const body: SlotBookingRequest = await req.json();
    const {
      marketId,
      marketName,
      slotTypeId,
      slotTypeName,
      inventoryIds,
      vendorName,
      vendorEmail,
      vendorPhone,
      vendorCategory,
      vendorType,
      boothSize,
      truckLengthFeet,
      hasGenerator,
      needsPower,
      powerAmps,
      needsWater,
      needsWifi,
      arrivalTime,
      setupNotes,
      notes,
      isRecurring,
      baseAmount,
      platformFeeAmount,
      totalAmount,
      guestEmail,
    } = body;

    // Determine customer email - use logged-in user email, or guest email, or vendor email as fallback
    const customerEmail = user?.email || guestEmail || vendorEmail;
    
    if (!customerEmail) {
      throw new Error("Email is required for booking");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get market owner's Stripe account for Connect
    const { data: market, error: marketError } = await supabaseAdmin
      .from('markets')
      .select('user_id, stripe_account_id, stripe_account_status')
      .eq('id', marketId)
      .single();

    if (marketError || !market) {
      throw new Error("Market not found");
    }

    // Check if user already has a Stripe customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Verify inventory availability
    for (const invId of inventoryIds) {
      const { data: inventory } = await supabaseAdmin
        .from('slot_inventory')
        .select('slots_remaining')
        .eq('id', invId)
        .single();
      
      if (!inventory || inventory.slots_remaining <= 0) {
        throw new Error("One or more slots are no longer available");
      }
    }

    // Calculate amounts in cents
    const amountInCents = Math.round(totalAmount * 100);
    const baseAmountInCents = Math.round(baseAmount * 100);
    const platformFeeInCents = Math.round(platformFeeAmount * 100);

    // Create checkout session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: baseAmountInCents,
            product_data: {
              name: `${slotTypeName} at ${marketName}`,
              description: `Vendor spot booking${isRecurring ? ` (${inventoryIds.length} weeks)` : ''}`,
            },
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            unit_amount: platformFeeInCents,
            product_data: {
              name: 'Service Fee',
              description: 'Platform service fee (12.9%)',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get("origin")}/market/${marketId}?booking=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/market/${marketId}?booking=cancelled`,
      metadata: {
        marketId,
        slotTypeId,
        inventoryIds: JSON.stringify(inventoryIds),
        userId: user?.id || '', // Empty string for guests
        isGuest: user ? 'false' : 'true',
        guestEmail: user ? '' : customerEmail,
        vendorUserId: market.user_id,
        vendorName,
        vendorEmail,
        vendorPhone,
        vendorCategory,
        vendorType,
        boothSize: boothSize || '',
        truckLengthFeet: truckLengthFeet?.toString() || '',
        hasGenerator: hasGenerator ? 'true' : 'false',
        needsPower: needsPower ? 'true' : 'false',
        powerAmps: powerAmps?.toString() || '',
        needsWater: needsWater ? 'true' : 'false',
        needsWifi: needsWifi ? 'true' : 'false',
        arrivalTime: arrivalTime || '',
        setupNotes: setupNotes || '',
        notes: notes || '',
        isRecurring: isRecurring ? 'true' : 'false',
        baseAmount: baseAmount.toString(),
        platformFeeAmount: platformFeeAmount.toString(),
        totalAmount: totalAmount.toString(),
      },
    };

    // If market has Stripe Connect, use it for transfer
    if (market.stripe_account_id && market.stripe_account_status === 'active') {
      sessionParams.payment_intent_data = {
        transfer_data: {
          destination: market.stripe_account_id,
          amount: baseAmountInCents, // Transfer base amount (minus platform fee)
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error('Error creating checkout session:', error);
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
