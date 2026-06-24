import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

// Polar product IDs → plan names (must match polar-checkout/index.ts)
const PRODUCT_PLAN_MAP: Record<string, string> = {
  "0a0ce061-b020-49e7-9ad0-9d047c438040": "pro",
  "0334dfad-6705-4fec-b21c-374d65a5f0c6": "agency",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[POLAR-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Polar sends POST; no CORS preflight needed for server-to-server
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Verify webhook secret
    const webhookSecret = Deno.env.get("POLAR_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("POLAR_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const signature = req.headers.get("webhook-signature") ?? req.headers.get("x-polar-signature");
    const body = await req.text();

    // Polar signs webhooks with HMAC-SHA256; verify before processing
    if (signature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );
      const sigBytes = hexToBytes(signature.replace(/^sha256=/, ""));
      const valid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(body));
      if (!valid) {
        logStep("Invalid webhook signature");
        return new Response("Invalid signature", { status: 401 });
      }
    }

    const event = JSON.parse(body);
    logStep("Event received", { type: event.type, id: event.data?.id });

    switch (event.type) {
      // Subscription created or renewed
      case "subscription.created":
      case "subscription.active":
      case "order.created": {
        const userId = event.data?.customer?.external_id ?? event.data?.external_customer_id;
        const productId = event.data?.product_id ?? event.data?.items?.[0]?.product_id;

        if (!userId) {
          logStep("No external customer id in event", { type: event.type });
          break;
        }

        const plan = PRODUCT_PLAN_MAP[productId] ?? "pro";
        const periodEnd = event.data?.current_period_end
          ? new Date(event.data.current_period_end * 1000).toISOString()
          : null;

        logStep("Activating subscription", { userId, plan, periodEnd });

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            is_premium: true,
            subscription_plan: plan,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (profileError) {
          logStep("Profile update failed", { error: profileError.message });
        }

        // Upsert subscription record
        const { error: subError } = await supabase
          .from("subscriptions")
          .upsert(
            {
              user_id: userId,
              plan,
              status: "active",
              current_period_start: event.data?.current_period_start
                ? new Date(event.data.current_period_start * 1000).toISOString()
                : new Date().toISOString(),
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (subError) {
          logStep("Subscription upsert failed", { error: subError.message });
        } else {
          logStep("Subscription activated", { userId, plan });
        }
        break;
      }

      // Subscription cancelled or expired
      case "subscription.canceled":
      case "subscription.revoked": {
        const userId = event.data?.customer?.external_id ?? event.data?.external_customer_id;
        if (!userId) {
          logStep("No external customer id in cancellation event");
          break;
        }

        logStep("Cancelling subscription", { userId });

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            is_premium: false,
            subscription_plan: "free",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (profileError) {
          logStep("Profile downgrade failed", { error: profileError.message });
        }

        const { error: subError } = await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (subError) {
          logStep("Subscription cancel failed", { error: subError.message });
        } else {
          logStep("Subscription cancelled", { userId });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}
