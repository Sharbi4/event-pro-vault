import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRO_PREMIUM_PRODUCT_ID = "prod_TrMmHn35KS01LS";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PRO-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating to free tier");
      // Update profile to free tier
      await supabaseClient
        .from('profiles')
        .update({ subscription_tier: 'free', subscription_ends_at: null })
        .eq('user_id', user.id);
      
      // Remove featured status from all packages
      await supabaseClient
        .from('vendor_packages')
        .update({ is_featured: false })
        .eq('user_id', user.id);

      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: "free",
        package_limit: 5,
        is_featured: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    // Check if user has Pro Premium subscription
    const proPremiumSub = subscriptions.data.find((sub: any) => 
      sub.items.data.some((item: any) => item.price.product === PRO_PREMIUM_PRODUCT_ID)
    );

    if (proPremiumSub) {
      const subscriptionEnd = new Date(proPremiumSub.current_period_end * 1000).toISOString();
      logStep("Pro Premium subscription found", { subscriptionId: proPremiumSub.id, endDate: subscriptionEnd });
      
      // Update profile with premium status
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_tier: 'premium', 
          subscription_ends_at: subscriptionEnd 
        })
        .eq('user_id', user.id);
      
      // Mark all user's packages as featured
      await supabaseClient
        .from('vendor_packages')
        .update({ is_featured: true })
        .eq('user_id', user.id);

      logStep("Updated profile and packages to premium/featured");
      
      return new Response(JSON.stringify({
        subscribed: true,
        tier: "premium",
        package_limit: 20,
        subscription_end: subscriptionEnd,
        is_featured: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("No Pro Premium subscription found, updating to free tier");
    
    // Update profile to free tier
    await supabaseClient
      .from('profiles')
      .update({ subscription_tier: 'free', subscription_ends_at: null })
      .eq('user_id', user.id);
    
    // Remove featured status
    await supabaseClient
      .from('vendor_packages')
      .update({ is_featured: false })
      .eq('user_id', user.id);

    return new Response(JSON.stringify({
      subscribed: false,
      tier: "free",
      package_limit: 5,
      is_featured: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-pro-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
