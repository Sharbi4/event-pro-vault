import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-MARKET-CONNECT-STATUS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get market with Stripe account ID
    const { data: market, error: marketError } = await supabaseClient
      .from("markets")
      .select("id, stripe_account_id, stripe_account_status")
      .eq("user_id", user.id)
      .single();

    if (marketError || !market) {
      return new Response(
        JSON.stringify({ status: "no_market", payoutsEnabled: false, chargesEnabled: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!market.stripe_account_id) {
      return new Response(
        JSON.stringify({ status: "not_started", payoutsEnabled: false, chargesEnabled: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check Connect account status
    const account = await stripe.accounts.retrieve(market.stripe_account_id);

    logStep("Account retrieved", {
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });

    // Determine status
    let newStatus = market.stripe_account_status;
    if (account.charges_enabled && account.payouts_enabled) {
      newStatus = "active";
    } else if (account.details_submitted) {
      newStatus = "pending_verification";
    } else if (market.stripe_account_id) {
      newStatus = "pending";
    }

    // Get pending requirements
    const pendingRequirements = account.requirements?.currently_due || [];
    const eventualRequirements = account.requirements?.eventually_due || [];

    // Update market if status changed
    if (newStatus !== market.stripe_account_status) {
      await supabaseClient
        .from("markets")
        .update({ stripe_account_status: newStatus })
        .eq("id", market.id);
      logStep("Market status updated", { newStatus });
    }

    return new Response(
      JSON.stringify({
        status: newStatus,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requirements: {
          currentlyDue: pendingRequirements,
          eventuallyDue: eventualRequirements,
          pendingVerification: account.requirements?.pending_verification || [],
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
