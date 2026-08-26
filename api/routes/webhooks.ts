import { Hono } from "hono";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, profiles, subscriptions } from "../lib/db";

export const webhooksRoutes = new Hono();

const STRIPE_PRODUCT_IDS = {
  pro: "prod_TvwX3mSDAVLO3W",
  agency: "prod_TvwXoxaboAYBpq",
};
const POLAR_PRODUCT_MAP: Record<string, string> = {
  "0a0ce061-b020-49e7-9ad0-9d047c438040": "pro",
  "0334dfad-6705-4fec-b21c-374d65a5f0c6": "agency",
};

// POST /api/webhooks/stripe
webhooksRoutes.post("/stripe", async (c) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) return c.json({ error: "Not configured" }, 500);

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" as any });
  const body = await c.req.text();
  const sig = c.req.header("stripe-signature");
  if (!sig) return c.json({ error: "No signature" }, 400);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch {
    return c.json({ error: "Invalid signature" }, 400);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan ?? "pro";
      if (!userId) break;
      await db.update(profiles).set({ isPremium: true, subscriptionPlan: plan, updatedAt: new Date() }).where(eq(profiles.userId, userId));
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const email = await getStripeCustomerEmail(stripe, sub.customer as string);
      if (!email) break;
      const [profile] = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
      if (!profile) break;
      const isActive = sub.status === "active" || sub.status === "trialing";
      const productId = sub.items.data[0]?.price.product as string;
      const plan = isActive ? (productId === STRIPE_PRODUCT_IDS.pro ? "pro" : productId === STRIPE_PRODUCT_IDS.agency ? "agency" : "free") : "free";
      await db.update(profiles).set({ isPremium: isActive, subscriptionPlan: plan, updatedAt: new Date() }).where(eq(profiles.userId, profile.userId));
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const email = await getStripeCustomerEmail(stripe, sub.customer as string);
      if (!email) break;
      const [profile] = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
      if (!profile) break;
      await db.update(profiles).set({ isPremium: false, subscriptionPlan: "free", updatedAt: new Date() }).where(eq(profiles.userId, profile.userId));
      break;
    }
  }

  return c.json({ received: true });
});

// POST /api/webhooks/polar
webhooksRoutes.post("/polar", async (c) => {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  if (!webhookSecret) return c.json({ error: "Not configured" }, 500);

  const signature = c.req.header("webhook-signature") ?? c.req.header("x-polar-signature");
  const body = await c.req.text();

  if (!signature) return c.json({ error: "No signature" }, 400);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(webhookSecret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const sigBytes = hexToBytes(signature.replace(/^sha256=/, ""));
  const valid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(body));
  if (!valid) return c.json({ error: "Invalid signature" }, 401);

  const event = JSON.parse(body);

  switch (event.type) {
    case "subscription.created":
    case "subscription.active":
    case "order.created": {
      const userId = event.data?.customer?.external_id ?? event.data?.external_customer_id;
      if (!userId) break;
      const productId = event.data?.product_id ?? event.data?.items?.[0]?.product_id;
      const plan = POLAR_PRODUCT_MAP[productId] ?? "pro";
      await db.update(profiles).set({ isPremium: true, subscriptionPlan: plan, updatedAt: new Date() }).where(eq(profiles.userId, userId));
      await db.insert(subscriptions).values({
        userId, plan, status: "active",
        currentPeriodStart: event.data?.current_period_start ? new Date(event.data.current_period_start * 1000) : new Date(),
        currentPeriodEnd: event.data?.current_period_end ? new Date(event.data.current_period_end * 1000) : null,
      }).onConflictDoUpdate({ target: subscriptions.userId, set: { plan, status: "active", updatedAt: new Date() } });
      break;
    }
    case "subscription.canceled":
    case "subscription.revoked": {
      const userId = event.data?.customer?.external_id ?? event.data?.external_customer_id;
      if (!userId) break;
      await db.update(profiles).set({ isPremium: false, subscriptionPlan: "free", updatedAt: new Date() }).where(eq(profiles.userId, userId));
      await db.update(subscriptions).set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() }).where(eq(subscriptions.userId, userId));
      break;
    }
  }

  return c.json({ received: true });
});

async function getStripeCustomerEmail(stripe: Stripe, customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return (customer as Stripe.Customer).email;
  } catch { return null; }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return bytes;
}
