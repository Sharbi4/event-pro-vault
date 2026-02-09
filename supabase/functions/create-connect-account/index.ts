import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CONNECT-ACCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logStep("Unauthorized - missing bearer token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Create client with user's auth header for proper JWT validation
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } },
      }
    );

    // SECURITY: Must pass token explicitly when verify_jwt=false
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      logStep("Unauthorized - invalid token", { message: userError?.message });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = userData.user;
    if (!user?.email) {
      logStep("Unauthorized - user missing email");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get profile to check if already has Stripe account
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("stripe_account_id, full_name")
      .eq("user_id", user.id)
      .single();

    // Get vendor details
    const { data: vendorDetails } = await supabaseClient
      .from("vendor_details")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://lovable.dev";

    let accountId = profile?.stripe_account_id;
    let needsNewAccount = !accountId;

    // Verify existing account still exists on this Stripe platform
    if (accountId) {
      try {
        await stripe.accounts.retrieve(accountId);
        logStep("Existing account verified", { accountId });
      } catch (verifyError) {
        logStep("Existing account invalid, will create new", { accountId });
        needsNewAccount = true;
        accountId = null;
      }
    }

    // Create new Connect account if doesn't exist or was invalid
    if (needsNewAccount) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        business_profile: {
          name: vendorDetails?.business_name || profile?.full_name || undefined,
          product_description: "Event services and packages",
        },
        metadata: {
          user_id: user.id,
          type: "vendor",
        },
      });

      accountId = account.id;
      logStep("Connect account created", { accountId });

      // Save account ID to profile
      await supabaseClient
        .from("profiles")
        .update({
          stripe_account_id: accountId,
          stripe_account_status: "pending",
          is_vendor: true,
        })
        .eq("user_id", user.id);
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/vendor-onboarding?step=connect-refresh`,
      return_url: `${origin}/vendor-onboarding?step=connect-complete`,
      type: "account_onboarding",
      collect: "eventually_due",
    });

    logStep("Account link created", { url: accountLink.url });

    return new Response(
      JSON.stringify({
        url: accountLink.url,
        accountId: accountId,
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
