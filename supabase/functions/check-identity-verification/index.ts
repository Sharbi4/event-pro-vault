import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-IDENTITY-VERIFICATION] ${step}${detailsStr}`);
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

    // Get profile with verification session ID
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("identity_verification_session_id, identity_verification_status")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ status: "not_started", verified: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile.identity_verification_session_id) {
      return new Response(
        JSON.stringify({ status: "not_started", verified: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check verification session status
    const session = await stripe.identity.verificationSessions.retrieve(
      profile.identity_verification_session_id
    );

    logStep("Verification session retrieved", { status: session.status });

    let newStatus = profile.identity_verification_status;
    if (session.status === "verified") {
      newStatus = "verified";
    } else if (session.status === "requires_input") {
      newStatus = "requires_input";
    } else if (session.status === "processing") {
      newStatus = "processing";
    } else if (session.status === "canceled") {
      newStatus = "canceled";
    }

    // Update profile if status changed
    if (newStatus !== profile.identity_verification_status) {
      await supabaseClient
        .from("profiles")
        .update({ identity_verification_status: newStatus })
        .eq("user_id", user.id);
      logStep("Profile status updated", { newStatus });
    }

    return new Response(
      JSON.stringify({
        status: newStatus,
        verified: session.status === "verified",
        sessionStatus: session.status,
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
