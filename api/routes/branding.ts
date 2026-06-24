import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { db, brandingSettings } from "../lib/db";

export const brandingRoutes = new Hono<{ Variables: { userId: string } }>();
brandingRoutes.use("*", requireAuth);

brandingRoutes.get("/", async (c) => {
  const [row] = await db.select().from(brandingSettings).where(eq(brandingSettings.userId, c.get("userId"))).limit(1);
  return c.json(row ?? null);
});

brandingRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const [upserted] = await db
    .insert(brandingSettings)
    .values({ userId, ...body })
    .onConflictDoUpdate({ target: brandingSettings.userId, set: { ...body, updatedAt: new Date() } })
    .returning();
  return c.json(upserted);
});

brandingRoutes.delete("/", async (c) => {
  await db.delete(brandingSettings).where(eq(brandingSettings.userId, c.get("userId")));
  return c.json({ ok: true });
});
