import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const POLAR_API = "https://api.polar.sh/v1";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[POLAR-PORTAL] ${step}${detailsStr}`);
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

    const polarToken = Deno.env.get("POLAR_ACCESS_TOKEN");
    if (!polarToken) throw new Error("Payment service unavailable");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error("Authentication failed");
    const user = userData.user;
    if (!user?.id) throw new Error("Authentication required");
    logStep("User authenticated", { userId: user.id });

    // Find the Polar customer by external_customer_id
    const customersResp = await fetch(
      `${POLAR_API}/customers/?external_customer_id=${user.id}&limit=1`,
      {
        headers: { "Authorization": `Bearer ${polarToken}` },
      }
    );

    if (!customersResp.ok) {
      const errBody = await customersResp.text();
      logStep("Polar customer lookup error", { status: customersResp.status, body: errBody });
      throw new Error("Payment service error");
    }

    const customersData = await customersResp.json();
    if (!customersData.items || customersData.items.length === 0) {
      throw new Error("No billing account found");
    }

    const customerId = customersData.items[0].id;
    logStep("Found Polar customer", { customerId });

    // Create customer portal session
    const portalResp = await fetch(`${POLAR_API}/customer-sessions/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${polarToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: customerId,
      }),
    });

    if (!portalResp.ok) {
      const errBody = await portalResp.text();
      logStep("Polar portal error", { status: portalResp.status, body: errBody });
      throw new Error("Payment service error");
    }

    const portalData = await portalResp.json();
    logStep("Customer portal session created", { url: portalData.customer_portal_url });

    return new Response(JSON.stringify({ url: portalData.customer_portal_url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    const safeMessages = ["Payment service unavailable", "Authentication required", "Authentication failed", "No billing account found", "Payment service error"];
    const clientMessage = safeMessages.includes(errorMessage) ? errorMessage : "An error occurred. Please try again.";
    return new Response(JSON.stringify({ error: clientMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
