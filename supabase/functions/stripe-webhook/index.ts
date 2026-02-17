import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product IDs for tier detection
const PRODUCT_IDS = {
  pro: "prod_TvwX3mSDAVLO3W",
  agency: "prod_TvwXoxaboAYBpq",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
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
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      logStep("Stripe key missing");
      throw new Error("Payment service unavailable");
    }
    if (!webhookSecret) {
      logStep("Webhook secret missing");
      throw new Error("Payment service unavailable");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      logStep("Signature verification failed", { error: String(err) });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Event verified", { type: event.type, id: event.id });

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;

        if (!userId) {
          logStep("No user_id in session metadata", { sessionId: session.id });
          break;
        }

        logStep("Checkout completed", { userId, plan, subscriptionId: session.subscription });

        // Update profile to premium
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .update({
            is_premium: true,
            subscription_plan: plan || 'pro',
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (profileError) {
          logStep("Error updating profile", { error: profileError.message });
        } else {
          logStep("Profile updated to premium", { userId, plan });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerEmail = await getCustomerEmail(stripe, subscription.customer as string);
        
        if (!customerEmail) {
          logStep("Could not get customer email");
          break;
        }

        // Get user by email
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("user_id")
          .eq("email", customerEmail)
          .single();

        if (!profile) {
          logStep("No profile found for email", { email: customerEmail });
          break;
        }

        const isActive = subscription.status === "active" || subscription.status === "trialing";
        const productId = subscription.items.data[0]?.price.product as string;
        
        // Determine plan
        let plan: string = 'free';
        if (isActive) {
          if (productId === PRODUCT_IDS.pro) plan = 'pro';
          else if (productId === PRODUCT_IDS.agency) plan = 'agency';
        }

        logStep("Subscription updated", { 
          userId: profile.user_id, 
          status: subscription.status, 
          plan,
          isActive 
        });

        const { error: updateError } = await supabaseClient
          .from("profiles")
          .update({
            is_premium: isActive,
            subscription_plan: plan,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", profile.user_id);

        if (updateError) {
          logStep("Error updating profile", { error: updateError.message });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerEmail = await getCustomerEmail(stripe, subscription.customer as string);
        
        if (!customerEmail) {
          logStep("Could not get customer email");
          break;
        }

        // Get user by email
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("user_id")
          .eq("email", customerEmail)
          .single();

        if (!profile) {
          logStep("No profile found for email", { email: customerEmail });
          break;
        }

        logStep("Subscription deleted/canceled", { userId: profile.user_id });

        // Revoke premium access
        const { error: revokeError } = await supabaseClient
          .from("profiles")
          .update({
            is_premium: false,
            subscription_plan: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", profile.user_id);

        if (revokeError) {
          logStep("Error revoking access", { error: revokeError.message });
        } else {
          logStep("Access revoked", { userId: profile.user_id });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerEmail = await getCustomerEmail(stripe, invoice.customer as string);
        
        logStep("Payment failed", { customerEmail, invoiceId: invoice.id });
        // Could add email notification here
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function getCustomerEmail(stripe: Stripe, customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return (customer as Stripe.Customer).email;
  } catch {
    return null;
  }
}
