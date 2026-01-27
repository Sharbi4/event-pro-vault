import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const logStep = (step: string, details?: unknown) => {
  console.log(`[NOTIFY-PROS-LEAD] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { category, city, state, eventDate } = await req.json();
    logStep("Received lead notification request", { category, city, state, eventDate });

    if (!category && !city) {
      logStep("No category or city provided, skipping");
      return new Response(JSON.stringify({ success: true, message: "No targeting criteria" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Find matching vendors with published packages in this category
    let query = supabaseClient
      .from('vendor_packages')
      .select(`
        id,
        name,
        category,
        user_id,
        profiles!inner(email, display_name),
        vendor_details!inner(city, state)
      `)
      .eq('is_published', true)
      .eq('is_active', true);

    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    const { data: packages, error } = await query;

    if (error) {
      logStep("Error fetching packages", { error: error.message });
      throw error;
    }

    logStep("Found packages", { count: packages?.length });

    // Filter by location if provided
    let matchingVendors = packages || [];
    if (city) {
      matchingVendors = matchingVendors.filter((pkg: any) => 
        pkg.vendor_details?.city?.toLowerCase().includes(city.toLowerCase()) ||
        pkg.vendor_details?.state?.toLowerCase() === state?.toLowerCase()
      );
    }

    logStep("Matching vendors after location filter", { count: matchingVendors.length });

    if (matchingVendors.length === 0) {
      return new Response(JSON.stringify({ success: true, notified: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get unique vendor emails
    const vendorEmails = [...new Set(matchingVendors.map((v: any) => v.profiles?.email).filter(Boolean))];
    logStep("Unique vendor emails", { count: vendorEmails.length });

    if (!RESEND_API_KEY || vendorEmails.length === 0) {
      logStep("Skipping email send - no API key or no emails");
      return new Response(JSON.stringify({ success: true, notified: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Send notification emails
    const eventDateFormatted = eventDate ? new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'TBD';

    const locationText = [city, state].filter(Boolean).join(', ') || 'your area';

    for (const email of vendorEmails) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "EventPros <noreply@vendibook.com>",
            to: [email as string],
            subject: `🎯 New ${category || 'event'} request in ${locationText}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">New Booking Request</h1>
                <p>Someone is looking for a <strong>${category || 'vendor'}</strong> in <strong>${locationText}</strong>!</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Event Date:</strong> ${eventDateFormatted}</p>
                  <p style="margin: 10px 0 0;"><strong>Location:</strong> ${locationText}</p>
                </div>

                <p>Make sure your packages are published to appear in their search results.</p>
                
                <a href="https://event-pro-vault.lovable.app/vendor-dashboard" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
                  View Your Dashboard
                </a>

                <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;" />
                <p style="color: #666; font-size: 12px;">
                  You received this because you have packages in the ${category || 'relevant'} category.
                </p>
              </div>
            `,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          logStep("Failed to send email", { email, error: errorText });
        } else {
          logStep("Email sent successfully", { email });
        }
      } catch (emailError) {
        logStep("Email error", { email, error: String(emailError) });
      }
    }

    return new Response(JSON.stringify({ success: true, notified: vendorEmails.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
