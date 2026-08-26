import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { requireAuth } from "../_lib/auth";
import { db, brandingSettings } from "../_lib/db";

export const brandingRoutes = new Hono<{ Variables: { userId: string } }>();
brandingRoutes.use("*", requireAuth);

brandingRoutes.get("/", async (c) => {
  const [row] = await db.select().from(brandingSettings).where(eq(brandingSettings.userId, c.get("userId"))).limit(1);
  return c.json(row ?? null);
});

const ALLOWED_FIELDS = [
  "logoUrl",
  "companyName",
  "tagline",
  "primaryColor",
  "secondaryColor",
  "website",
  "email",
  "phone",
  "address",
] as const;

brandingRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) if (key in body) updates[key] = body[key];

  const [upserted] = await db
    .insert(brandingSettings)
    .values({ userId, ...updates })
    .onConflictDoUpdate({ target: brandingSettings.userId, set: { ...updates, updatedAt: new Date() } })
    .returning();
  return c.json(upserted);
});

brandingRoutes.delete("/", async (c) => {
  await db.delete(brandingSettings).where(eq(brandingSettings.userId, c.get("userId")));
  return c.json({ ok: true });
});
