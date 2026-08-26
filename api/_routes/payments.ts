import { Hono } from "hono";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { requireAuth } from "../_lib/auth";
import { db, profiles } from "../_lib/db";

export const paymentsRoutes = new Hono<{ Variables: { userId: string } }>();

const STRIPE_PRICE_IDS = {
  pro: "price_1Sy4e7PSEDfdwE62sfCXnOXg",
  agency: "price_1Sy4eXPSEDfdwE62A38yHk8a",
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key, { apiVersion: "2025-08-27.basil" as any });
}

// POST /api/payments/stripe/checkout
paymentsRoutes.post("/stripe/checkout", requireAuth, async (c) => {
  const userId = c.get("userId");
  const { plan } = await c.req.json();
  if (!plan || !(plan in STRIPE_PRICE_IDS)) return c.json({ error: "Invalid plan" }, 400);

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  const stripe = getStripe();
  const origin = c.req.header("Origin") ?? process.env.FRONTEND_URL ?? "https://progene.lovable.app";

  const customers = await stripe.customers.list({ email: profile?.email ?? "", limit: 1 });
  const customerId = customers.data[0]?.id;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : profile?.email ?? undefined,
    line_items: [{ price: STRIPE_PRICE_IDS[plan as keyof typeof STRIPE_PRICE_IDS], quantity: 1 }],
    mode: "subscription",
    success_url: `${origin}/settings?tab=billing&success=true`,
    cancel_url: `${origin}/settings?tab=billing&canceled=true`,
    metadata: { user_id: userId, plan },
  });

  return c.json({ url: session.url });
});

// POST /api/payments/stripe/portal
paymentsRoutes.post("/stripe/portal", requireAuth, async (c) => {
  const userId = c.get("userId");
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (!profile?.email) return c.json({ error: "No billing account found" }, 404);

  const stripe = getStripe();
  const customers = await stripe.customers.list({ email: profile.email, limit: 1 });
  if (!customers.data.length) return c.json({ error: "No billing account found" }, 404);

  const origin = c.req.header("Origin") ?? process.env.FRONTEND_URL ?? "https://progene.lovable.app";
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: `${origin}/settings?tab=billing`,
  });

  return c.json({ url: portalSession.url });
});
