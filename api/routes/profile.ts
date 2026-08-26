import { Hono } from "hono";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { requireAuth } from "../lib/auth";
import { db, profiles, clients, proposalTemplates, timeEntries, subscriptions } from "../lib/db";
import { clerk } from "../lib/clerk";

export const profileRoutes = new Hono<{ Variables: { userId: string } }>();

profileRoutes.use("*", requireAuth);

// GET /api/profile
profileRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  let [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

  if (!profile) {
    // Auto-create on first access
    const clerkUser = await clerk.users.getUser(userId);
    const [created] = await db
      .insert(profiles)
      .values({
        userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
        fullName: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
        avatarUrl: clerkUser.imageUrl ?? null,
      })
      .returning();
    profile = created;
  }

  return c.json(profile);
});

// PUT /api/profile
profileRoutes.put("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const allowed = ["fullName", "companyName", "avatarUrl", "email"];
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of allowed) if (key in body) updates[key] = body[key];

  const [updated] = await db
    .update(profiles)
    .set(updates)
    .where(eq(profiles.userId, userId))
    .returning();

  return c.json(updated);
});

// DELETE /api/profile — cancel billing, delete owned data, anonymize profile
profileRoutes.delete("/", async (c) => {
  const userId = c.get("userId");
  const anonId = randomHex();

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

  // Cancel active subscriptions (best-effort; must happen before the profile
  // email is anonymized since Stripe lookups key off the account email).
  await Promise.allSettled([
    cancelStripeSubscription(profile?.email ?? null),
    cancelPolarSubscription(userId),
  ]);

  // Delete owned data
  await db.delete(clients).where(eq(clients.userId, userId));
  await db.delete(proposalTemplates).where(eq(proposalTemplates.userId, userId));
  await db.delete(timeEntries).where(eq(timeEntries.userId, userId));
  await db.delete(subscriptions).where(eq(subscriptions.userId, userId));

  await db.update(profiles).set({
    email: `deleted_${anonId}@deleted.local`,
    fullName: "Deleted User",
    companyName: null,
    avatarUrl: null,
    deletedAt: new Date(),
    anonymized: true,
    isPremium: false,
    subscriptionPlan: "free",
    updatedAt: new Date(),
  }).where(eq(profiles.userId, userId));

  // Revoke all public proposals
  const { proposals: proposalsTable } = await import("../lib/db");
  await db.update(proposalsTable).set({ isPublic: false, shareToken: null }).where(eq(proposalsTable.userId, userId));

  // Attempt to delete Clerk user (best-effort)
  try { await clerk.users.deleteUser(userId); } catch { /* ignore */ }

  return c.json({ ok: true });
});

async function cancelStripeSubscription(email: string | null) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !email) return;
  try {
    const stripe = new Stripe(key, { apiVersion: "2025-08-27.basil" as any });
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customerId = customers.data[0]?.id;
    if (!customerId) return;
    const subs = await stripe.subscriptions.list({ customer: customerId, status: "active" });
    await Promise.all(subs.data.map((s) => stripe.subscriptions.cancel(s.id)));
  } catch (err) {
    console.error("Failed to cancel Stripe subscription on account deletion", err);
  }
}

async function cancelPolarSubscription(userId: string) {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) return;
  try {
    const resp = await fetch(`https://api.polar.sh/v1/subscriptions/?external_customer_id=${userId}&active=true&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return;
    const data = await resp.json();
    const active = (data.items ?? []) as Array<{ id: string }>;
    await Promise.all(
      active.map((s) =>
        fetch(`https://api.polar.sh/v1/subscriptions/${s.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null)
      )
    );
  } catch (err) {
    console.error("Failed to cancel Polar subscription on account deletion", err);
  }
}

function randomHex() {
  return Math.random().toString(16).slice(2);
}
