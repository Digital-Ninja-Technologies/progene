import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { requireAuth } from "../_lib/auth";
import { db, profiles, subscriptions } from "../_lib/db";

export const subscriptionRoutes = new Hono<{ Variables: { userId: string } }>();
subscriptionRoutes.use("*", requireAuth);

const POLAR_API = "https://api.polar.sh/v1";
const PRODUCT_IDS: Record<string, string> = {
  pro: "0a0ce061-b020-49e7-9ad0-9d047c438040",
  agency: "0334dfad-6705-4fec-b21c-374d65a5f0c6",
};
const PRODUCT_PLAN_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(PRODUCT_IDS).map(([plan, id]) => [id, plan])
);

// GET /api/subscription — check current subscription status
subscriptionRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const polarToken = process.env.POLAR_ACCESS_TOKEN;

  if (!polarToken) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    return c.json({ subscribed: profile?.isPremium ?? false, plan: profile?.subscriptionPlan ?? "free", subscription_end: null });
  }

  const resp = await fetch(`${POLAR_API}/subscriptions/?external_customer_id=${userId}&active=true&limit=10`, {
    headers: { Authorization: `Bearer ${polarToken}` },
  });

  if (!resp.ok) return c.json({ error: "Payment service unavailable" }, 503);

  const data = await resp.json();
  const activeSubs = (data.items ?? []).filter((s: any) => s.status === "active" || s.status === "trialing");

  if (activeSubs.length === 0) {
    await db.update(profiles).set({ isPremium: false, subscriptionPlan: "free", updatedAt: new Date() }).where(eq(profiles.userId, userId));
    return c.json({ subscribed: false, plan: "free", subscription_end: null });
  }

  const sub = activeSubs[0];
  const plan = PRODUCT_PLAN_MAP[sub.product_id ?? sub.product?.id] ?? "pro";
  await db.update(profiles).set({ isPremium: true, subscriptionPlan: plan, updatedAt: new Date() }).where(eq(profiles.userId, userId));

  return c.json({ subscribed: true, plan, subscription_end: sub.current_period_end ?? null, subscription_id: sub.id });
});

// POST /api/subscription/checkout — create Polar checkout
subscriptionRoutes.post("/checkout", async (c) => {
  const userId = c.get("userId");
  const { plan } = await c.req.json();

  if (!plan || !PRODUCT_IDS[plan]) return c.json({ error: "Invalid plan" }, 400);

  const polarToken = process.env.POLAR_ACCESS_TOKEN;
  if (!polarToken) return c.json({ error: "Payment service unavailable" }, 503);

  const origin = c.req.header("Origin") ?? process.env.FRONTEND_URL ?? "https://progene.lovable.app";
  const resp = await fetch(`${POLAR_API}/checkouts/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${polarToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      products: [PRODUCT_IDS[plan]],
      success_url: `${origin}/settings?tab=billing&success=true&checkout_id={CHECKOUT_ID}`,
      external_customer_id: userId,
    }),
  });

  if (!resp.ok) return c.json({ error: "Payment service error" }, 503);
  const checkout = await resp.json();
  return c.json({ url: checkout.url });
});

// POST /api/subscription/portal — open Polar customer portal
subscriptionRoutes.post("/portal", async (c) => {
  const userId = c.get("userId");
  const polarToken = process.env.POLAR_ACCESS_TOKEN;
  if (!polarToken) return c.json({ error: "Payment service unavailable" }, 503);

  const customersResp = await fetch(`${POLAR_API}/customers/?external_customer_id=${userId}&limit=1`, {
    headers: { Authorization: `Bearer ${polarToken}` },
  });
  if (!customersResp.ok) return c.json({ error: "Payment service error" }, 503);
  const customersData = await customersResp.json();
  if (!customersData.items?.length) return c.json({ error: "No billing account found" }, 404);

  const portalResp = await fetch(`${POLAR_API}/customer-sessions/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${polarToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ customer_id: customersData.items[0].id }),
  });
  if (!portalResp.ok) return c.json({ error: "Payment service error" }, 503);
  const portalData = await portalResp.json();
  return c.json({ url: portalData.customer_portal_url });
});
