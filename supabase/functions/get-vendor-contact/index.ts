import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[GET-VENDOR-CONTACT] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { vendor_user_id } = await req.json();
    if (!vendor_user_id) {
      throw new Error("vendor_user_id is required");
    }
    logStep("Received request", { vendor_user_id });

    // Get vendor email from auth.users using admin API
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserById(vendor_user_id);
    
    if (authError || !authUser?.user) {
      throw new Error(`User not found: ${authError?.message || 'Unknown error'}`);
    }

    const email = authUser.user.email;
    logStep("Found user email", { email });

    // Get additional info from profiles
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name, display_name, phone')
      .eq('user_id', vendor_user_id)
      .single();

    // Get business name from vendor_details
    const { data: vendorDetails } = await supabaseClient
      .from('vendor_details')
      .select('business_name')
      .eq('user_id', vendor_user_id)
      .single();

    const response = {
      email,
      display_name: vendorDetails?.business_name || profile?.display_name || profile?.full_name || 'Vendor',
      phone: profile?.phone || null,
    };

    logStep("Returning vendor contact", response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
