import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-IDENTITY-VERIFICATION] ${step}${detailsStr}`);
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
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const origin = req.headers.get("origin") || "https://lovable.dev";

    // Create a verification session
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: {
        user_id: user.id,
        user_email: user.email,
      },
      options: {
        document: {
          require_matching_selfie: true,
        },
      },
      return_url: `${origin}/vendor-onboarding?step=identity-complete`,
    });

    logStep("Verification session created", { sessionId: verificationSession.id });

    // Update user profile with verification session ID
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        identity_verification_session_id: verificationSession.id,
        identity_verification_status: "pending",
      })
      .eq("user_id", user.id);

    if (updateError) {
      logStep("Error updating profile", { error: updateError.message });
    }

    return new Response(
      JSON.stringify({
        url: verificationSession.url,
        sessionId: verificationSession.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });

    // Stripe Identity rejects accounts/regions that aren't supported.
    // Detect that case and return a structured fallback (HTTP 200) so the
    // frontend can show a friendly "verification unavailable" state instead
    // of crashing on a 500.
    const isUnsupported =
      /identity/i.test(errorMessage) &&
      /(use[- ]?case|location|support|country|not\s+available)/i.test(errorMessage);

    if (isUnsupported) {
      return new Response(
        JSON.stringify({
          error: "IDENTITY_UNSUPPORTED",
          fallback: true,
          message:
            "Identity verification isn't available for your account or region yet. You can keep using the platform — verification is optional.",
          docs: "https://docs.stripe.com/identity/use-cases",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
