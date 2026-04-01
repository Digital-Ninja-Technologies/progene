import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const POLAR_API = "https://api.polar.sh/v1";

// Polar product IDs
const PRODUCT_IDS: Record<string, string> = {
  pro: "0a0ce061-b020-49e7-9ad0-9d047c438040",
  agency: "0334dfad-6705-4fec-b21c-374d65a5f0c6",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[POLAR-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const polarToken = Deno.env.get("POLAR_ACCESS_TOKEN");
    if (!polarToken) {
      logStep("Polar token missing");
      throw new Error("Payment service unavailable");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.id) throw new Error("Authentication required");
    logStep("User authenticated", { userId: user.id });

    const { plan } = await req.json();
    if (!plan || !PRODUCT_IDS[plan]) {
      throw new Error("Invalid plan selected");
    }
    logStep("Plan selected", { plan });

    const origin = req.headers.get("origin") || "https://progene.lovable.app";

    // Create Polar checkout session
    const checkoutResp = await fetch(`${POLAR_API}/checkouts/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${polarToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        products: [PRODUCT_IDS[plan]],
        success_url: `${origin}/settings?tab=billing&success=true&checkout_id={CHECKOUT_ID}`,
        external_customer_id: user.id,
      }),
    });

    if (!checkoutResp.ok) {
      const errBody = await checkoutResp.text();
      logStep("Polar checkout error", { status: checkoutResp.status, body: errBody });
      throw new Error("Payment service error");
    }

    const checkout = await checkoutResp.json();
    logStep("Checkout session created", { checkoutId: checkout.id, url: checkout.url });

    return new Response(JSON.stringify({ url: checkout.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    const safeMessages = ["Payment service unavailable", "Authentication required", "Invalid plan selected", "Payment service error"];
    const clientMessage = safeMessages.includes(errorMessage) ? errorMessage : "An error occurred. Please try again.";
    return new Response(JSON.stringify({ error: clientMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
