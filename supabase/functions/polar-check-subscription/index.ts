import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const POLAR_API = "https://api.polar.sh/v1";

// Polar product IDs for tier detection
const PRODUCT_IDS: Record<string, string> = {
  "0a0ce061-b020-49e7-9ad0-9d047c438040": "pro",
  "0334dfad-6705-4fec-b21c-374d65a5f0c6": "agency",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[POLAR-CHECK-SUB] ${step}${detailsStr}`);
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
    if (!polarToken) {
      logStep("Polar token missing");
      throw new Error("Payment service unavailable");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error("Authentication failed");
    const user = userData.user;
    if (!user?.id) throw new Error("Authentication required");
    logStep("User authenticated", { userId: user.id });

    // Check Polar subscriptions for this user (by external_customer_id)
    const subsResp = await fetch(
      `${POLAR_API}/subscriptions/?external_customer_id=${user.id}&active=true&limit=10`,
      {
        headers: { "Authorization": `Bearer ${polarToken}` },
      }
    );

    if (!subsResp.ok) {
      const errBody = await subsResp.text();
      logStep("Polar subscription check error", { status: subsResp.status, body: errBody });
      throw new Error("Payment service unavailable");
    }

    const subsData = await subsResp.json();
    const activeSubs = subsData.items?.filter(
      (s: any) => s.status === "active" || s.status === "trialing"
    ) || [];

    if (activeSubs.length === 0) {
      logStep("No active subscription found");

      await supabaseClient.from("profiles").update({
        is_premium: false,
        subscription_plan: "free",
      }).eq("user_id", user.id);

      return new Response(JSON.stringify({
        subscribed: false,
        plan: "free",
        subscription_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subscription = activeSubs[0];
    const productId = subscription.product_id || subscription.product?.id;
    const plan = PRODUCT_IDS[productId] || "pro";
    const subscriptionEnd = subscription.current_period_end || null;

    logStep("Active subscription found", {
      subscriptionId: subscription.id,
      plan,
      status: subscription.status,
      endDate: subscriptionEnd,
    });

    // Update profile
    const { error: updateError } = await supabaseClient.from("profiles").update({
      is_premium: true,
      subscription_plan: plan,
    }).eq("user_id", user.id);

    if (updateError) {
      logStep("Error updating profile", { error: updateError.message });
    }

    return new Response(JSON.stringify({
      subscribed: true,
      plan,
      subscription_end: subscriptionEnd,
      subscription_id: subscription.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    const safeMessages = ["Payment service unavailable", "Authentication required", "Authentication failed"];
    const clientMessage = safeMessages.includes(errorMessage) ? errorMessage : "An error occurred. Please try again.";
    return new Response(JSON.stringify({ error: clientMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
