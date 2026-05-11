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

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // 1. Require authenticated caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = userData.user.id;

    const { vendor_user_id } = await req.json();
    if (!vendor_user_id) {
      return new Response(JSON.stringify({ error: "vendor_user_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Authorize: caller is the vendor themselves, an admin, or has an
    //    active booking relationship with the vendor.
    let authorized = callerId === vendor_user_id;

    if (!authorized) {
      const { data: adminRole } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", callerId)
        .eq("role", "admin")
        .maybeSingle();
      if (adminRole) authorized = true;
    }

    if (!authorized) {
      const { data: booking } = await supabaseAdmin
        .from("bookings")
        .select("id")
        .eq("vendor_user_id", vendor_user_id)
        .or(`user_id.eq.${callerId},customer_email.eq.${userData.user.email ?? ""}`)
        .limit(1)
        .maybeSingle();
      if (booking) authorized = true;
    }

    if (!authorized) {
      logStep("Forbidden", { callerId, vendor_user_id });
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Authorized request", { callerId, vendor_user_id });

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(vendor_user_id);
    if (authError || !authUser?.user) {
      return new Response(JSON.stringify({ error: "Vendor not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = authUser.user.email;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, display_name, phone')
      .eq('user_id', vendor_user_id)
      .single();

    const { data: vendorDetails } = await supabaseAdmin
      .from('vendor_details')
      .select('business_name')
      .eq('user_id', vendor_user_id)
      .single();

    const response = {
      email,
      display_name: vendorDetails?.business_name || profile?.display_name || profile?.full_name || 'Vendor',
      phone: profile?.phone || null,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Request failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
