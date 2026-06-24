import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { z } from "https://esm.sh/zod@3.22.4";

const PRODUCT_IDS: Record<string, string> = {
  "0a0ce061-b020-49e7-9ad0-9d047c438040": "pro",
  "0334dfad-6705-4fec-b21c-374d65a5f0c6": "agency",
};

const ACTIVE_STATUSES = ["active", "trialing", "uncanceled"];
const INACTIVE_STATUSES = ["canceled", "revoked", "past_due", "paused", "unpaid", "incomplete", "incomplete_expired"];

const WebhookPayloadSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.record(z.any()).default({}),
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[POLAR-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const rawBody = await req.text();
    const polarSecret = Deno.env.get("POLAR_WEBHOOK_SECRET");

    if (!polarSecret) {
      logStep("Webhook secret missing");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Standard Webhooks expects a base64-encoded secret
    const encodedSecret = btoa(polarSecret);
    const wh = new Webhook(encodedSecret);

    const headers = Object.fromEntries(req.headers.entries());
    const verifiedPayload = wh.verify(rawBody, headers);

    const parsed = WebhookPayloadSchema.safeParse(verifiedPayload);
    if (!parsed.success) {
      logStep("Invalid payload shape", { error: parsed.error.message });
      return new Response(JSON.stringify({ error: "Invalid webhook payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { id: eventId, type: eventType, data } = parsed.data;

    logStep("Webhook received", { eventType, eventId });

    // Idempotency check
    const { data: existingEvent } = await supabaseClient
      .from("polar_webhook_events")
      .select("id")
      .eq("polar_event_id", eventId)
      .maybeSingle();

    if (existingEvent) {
      logStep("Event already processed", { eventId });
      return new Response(JSON.stringify({ received: true, already_processed: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract user ID from customer external_id
    const userId = data.customer?.external_id;

    // Process subscription events
    if (eventType?.startsWith("subscription.")) {
      if (userId) {
        const status = data.status;
        const productId = data.product_id || data.product?.id;
        const plan = PRODUCT_IDS[productId] || "pro";

        const isActive = ACTIVE_STATUSES.includes(status);
        const isInactive = INACTIVE_STATUSES.includes(status);

        if (isActive) {
          const { error } = await supabaseClient.from("profiles").update({
            is_premium: true,
            subscription_plan: plan,
          }).eq("user_id", userId);

          if (error) {
            logStep("Error activating premium", { error: error.message });
          } else {
            logStep("Activated premium", { userId, plan });
          }
        } else if (isInactive) {
          const { error } = await supabaseClient.from("profiles").update({
            is_premium: false,
            subscription_plan: "free",
          }).eq("user_id", userId);

          if (error) {
            logStep("Error deactivating premium", { error: error.message });
          } else {
            logStep("Deactivated premium", { userId, status });
          }
        }
      } else {
        logStep("No user ID in subscription event", { eventId });
      }
    }

    // Record event for idempotency
    const { error: insertError } = await supabaseClient.from("polar_webhook_events").insert({
      polar_event_id: eventId,
      event_type: eventType,
      payload: parsed.data,
    });

    if (insertError) {
      logStep("Error recording event", { error: insertError.message });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
