import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { db, profiles } from "../lib/db";
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

// DELETE /api/profile — soft delete / anonymize
profileRoutes.delete("/", async (c) => {
  const userId = c.get("userId");
  const anonId = randomHex();

  await db.update(profiles).set({
    email: `deleted_${anonId}@deleted.local`,
    fullName: "Deleted User",
    companyName: null,
    avatarUrl: null,
    deletedAt: new Date(),
    anonymized: true,
    updatedAt: new Date(),
  }).where(eq(profiles.userId, userId));

  // Revoke all public proposals
  const { proposals: proposalsTable } = await import("../lib/db");
  await db.update(proposalsTable).set({ isPublic: false, shareToken: null }).where(eq(proposalsTable.userId, userId));

  // Attempt to delete Clerk user (best-effort)
  try { await clerk.users.deleteUser(userId); } catch { /* ignore */ }

  return c.json({ ok: true });
});

function randomHex() {
  return Math.random().toString(16).slice(2);
}
