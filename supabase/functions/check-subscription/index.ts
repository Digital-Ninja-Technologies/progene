import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Product IDs for tier detection
const PRODUCT_IDS = {
  pro: "prod_TvwX3mSDAVLO3W",
  agency: "prod_TvwXoxaboAYBpq",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found, setting free plan");
      // Update profile to free plan
      await supabaseClient.from('profiles').update({
        is_premium: false,
        subscription_plan: 'free',
      }).eq('user_id', user.id);
      
      return new Response(JSON.stringify({ 
        subscribed: false, 
        plan: 'free',
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    // Also check for trialing subscriptions
    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 1,
    });

    const allActiveSubscriptions = [...subscriptions.data, ...trialingSubscriptions.data];

    if (allActiveSubscriptions.length === 0) {
      logStep("No active subscription found, revoking access");
      
      // Revoke premium access
      await supabaseClient.from('profiles').update({
        is_premium: false,
        subscription_plan: 'free',
      }).eq('user_id', user.id);
      
      return new Response(JSON.stringify({ 
        subscribed: false, 
        plan: 'free',
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = allActiveSubscriptions[0];
    let subscriptionEnd: string | null = null;
    try {
      if (subscription.current_period_end) {
        const endDate = new Date(Number(subscription.current_period_end) * 1000);
        if (!isNaN(endDate.getTime())) {
          subscriptionEnd = endDate.toISOString();
        }
      }
    } catch (e) {
      logStep("Could not parse subscription end date", { raw: subscription.current_period_end });
    }
    const productId = subscription.items.data[0].price.product as string;
    
    // Determine plan based on product ID
    let plan: 'free' | 'pro' | 'agency' = 'free';
    if (productId === PRODUCT_IDS.pro) {
      plan = 'pro';
    } else if (productId === PRODUCT_IDS.agency) {
      plan = 'agency';
    }
    
    logStep("Active subscription found", { 
      subscriptionId: subscription.id, 
      plan,
      status: subscription.status,
      endDate: subscriptionEnd 
    });

    // Update profile in Supabase
    const { error: updateError } = await supabaseClient.from('profiles').update({
      is_premium: true,
      subscription_plan: plan,
    }).eq('user_id', user.id);

    if (updateError) {
      logStep("Error updating profile", { error: updateError.message });
    } else {
      logStep("Profile updated successfully", { userId: user.id, plan });
    }

    return new Response(JSON.stringify({
      subscribed: true,
      plan,
      subscription_end: subscriptionEnd,
      subscription_id: subscription.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
